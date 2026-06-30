// SDK Logger for tracking RecallAI SDK operations
// This module is shared between main and renderer processes

// Create an event emitter for communication between processes
const { EventEmitter } = require('events');
const logger = new EventEmitter();

// Export the logger
module.exports = {
  // Log an SDK API call
  logApiCall: function(method, params = {}) {
    const logEntry = {
      type: 'api-call',
      method,
      params,
      timestamp: new Date()
    };

    // Emit the log event
    logger.emit('log', logEntry);

    // Return a reference to the logger for chaining
    return this;
  },

  // Log an SDK event
  logEvent: function(eventType, data = {}) {
    const logEntry = {
      type: 'event',
      eventType,
      data,
      timestamp: new Date()
    };

    // Emit the log event
    logger.emit('log', logEntry);

    // Return a reference to the logger for chaining
    return this;
  },

  // Log an error
  logError: function(errorType, message) {
    const logEntry = {
      type: 'error',
      errorType,
      message,
      timestamp: new Date()
    };

    // Emit the log event
    logger.emit('log', logEntry);

    // Return a reference to the logger for chaining
    return this;
  },

  // Log a generic message
  log: function(message, level = 'info') {
    const logEntry = {
      type: level,
      message,
      timestamp: new Date()
    };

    // Emit the log event
    logger.emit('log', logEntry);

    // Return a reference to the logger for chaining
    return this;
  },

  // Set up a listener for logs
  onLog: function(callback) {
    logger.on('log', callback);
    return this;
  },

  // Remove a log listener
  removeLogListener: function(callback) {
    logger.off('log', callback);
    return this;
  }
};
