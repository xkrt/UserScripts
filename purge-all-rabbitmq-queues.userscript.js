// ==UserScript==
// @name        Purge all RabbitMQ queues
// @grant GM_registerMenuCommand
// @grant alert
// @namespace   rabbitmq
// @include     http://localhost:15672/*
// @version     1
// @require     http://github.com/sizzlemctwizzle/GM_config/raw/master/gm_config.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js
// @require     http://code.jquery.com/ui/1.10.3/jquery-ui.js
// ==/UserScript==

'use strict';

var runPurger = function() {
    console.log('Purging all RabbitMQ queues...');
    
    $.get('/api/queues', function(queues) {
        $.when.apply($, $.map(queues, function(q) { return purgeQueue(q.name); }))
            .done(show);
    });

    function purgeQueue(queueName) {
        return $.ajax({
            url: '/api/queues/%2F/' + queueName + '/contents',
            type: 'DELETE',
            success: function(_) {
                console.log('Queue ' + queueName + ' purged!')
            },
            error: function(xhr, ajaxOptions, thrownError) {
                var msg = xhr.status + ': ' + thrownError;
                alert(msg);
            }
        });
    }
}

var onLoad = function() {
    console.log('Registering purger user script');
    GM_registerMenuCommand('Purge', runPurger, 'p');
  
    document.addEventListener('keydown', function(e) {
        // pressed ctrl+shift+alt+p
        if (e.keyCode == 80 && e.shiftKey && e.ctrlKey && e.altKey) {
            runPurger();
        }
    }, false);
    
    $('<link>')
        .attr('rel', 'stylesheet')
        .attr('href', 'http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css')
        .appendTo($('head'));
    
    var tooltip = $('<div>')
        .attr('id', 'queue-purger-tooltip')
        .addClass('ui-corner-all')
        .css({
          backgroundColor: '#FFFDC2',
          display: 'table-cell',
          textAlign: 'center',
          padding: '0.1em',
          position: 'absolute',
          verticalAlign: 'middle',
          top: '50%',
          left: '50%',
          zIndex: '1000',
          width: '10em'
        })
        .append($('<p>All queues was purged</p>'))
        .prependTo($('body'))
        .hide();

    var top = $(window).scrollTop() - (tooltip.outerHeight() / 2);
    var left = -(tooltip.outerWidth() / 2);
    tooltip.css({'margin-top': top,'margin-left': left});
}

function show() {
    $('#queue-purger-tooltip').show();
    enqueueFadeout();
};

function enqueueFadeout() {
    setTimeout(function() {
        $('#queue-purger-tooltip:visible').fadeOut();
    }, 1000);
};

function delay(f, t) {
    var a = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
    window.setTimeout(function() { f.apply(null, a); }, t);
}

delay(onLoad, 200);
