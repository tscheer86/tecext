/**
 * This is injected into the page to have access to existing javascript variables, events, data
 * from web sockets, and functions. It will send messages back and forth to the content script
 * that injected it; which will pipe back to the background script for the extension.
 */

 // Send intercepted data to the content script:
function doReceiveOverride(msg) {
    document.dispatchEvent(new CustomEvent('tecReceiveMessage', {
        detail: {
            timestamp: new Date().toISOString(),
            data: msg
        }
    }));
}

// Override the doReceive function on the page to intercept data, then send it on.
if (typeof doReceive !== 'undefined') {
    const origDoReceive = doReceive;
    doReceive = function (msg) {
        doReceiveOverride(msg);

        // Colorize 'say to'
        // if (msg.indexOf('say to') >= 0
        //     || msg.indexOf(' says') >= 0
        //     || msg.indexOf(' ask') >= 0
        //     || msg.indexOf(' exclaim') >= 0
        //     || msg.indexOf(' wink') >= 0) {
        //     msg = '</font><font color="#0020ff">' + msg;
        // }

        origDoReceive.apply(this, arguments);
        return;
    };
}

// Send intercepted commands to the content script:
function doSendOverride(msg) {
    document.dispatchEvent(new CustomEvent('tecSendCommand', {
        detail: {
            timestamp: new Date().toISOString(),
            command: msg
        }
    }));
}

// Override the doSend function on the page to intercept commands entered.
if (typeof doSend !== 'undefined') {
    const origDoSend = doSend;
    doSend = function (msg, noecho) {
        doSendOverride(msg);
        // Don't apply the original function if a slash command is detected.
        if (msg.indexOf('/') !== 0) {
            origDoSend.apply(this, arguments);
        }
        return;
    }
}

// Receive commands from the content script, and send them to the existing doSend
// function on the page. This function pipes the command back to the web socket.
document.addEventListener('tecSendMessage', function (e) {
    const msg = e.detail.data;
    if (msg) {
        // Ref: orchil.js - doSend(message, noecho)
        doSend(msg, true);
    }
});


/**
 * This section is to create elements on the right sidebar and attach events to them.
 */
setTimeout(function() {
    // Remove the focusFix event from mouseup so click events can fire.
    window.removeEventListener("mouseup", fixFocus );

    // Insert UI elements above the macro area.
    document.getElementById('macro_area').insertAdjacentHTML('beforebegin',`
        <style>
            @keyframes fadeIn {
                from {
                    opacity:0;
                }
                to {
                    opacity:1;
                }
            }
        </style>
        <div id="tecext" style="
            margin-bottom: 3px;
            padding: 6px;
            animation: fadeIn 0.75s;">
            <div id="editScripts" style="
                cursor: pointer;
                background-color:#5eba7d;">Edit Scripts</div>
        </div>
    `);

    // Send an event to the content script to open the edit scripts window.
    document.getElementById('editScripts').addEventListener("click", function() {
        document.dispatchEvent(new CustomEvent('tecUICommand', {
            detail: {
                timestamp: new Date().toISOString(),
                command: 'openEditScripts'
            }
        }));
    });

}, 1400);





