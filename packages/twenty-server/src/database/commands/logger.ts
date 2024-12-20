import { Logger } from '@nestjs/common';

interface CommandLoggerOptions {
  verbose?: boolean;
  constructorName: string;
}

/**
 * The CommandLogger class wraps the NEST Logger instance
 * and adds a verbose option for ready to debug messages.
 *
 * @param {string} options.constructorName - The name to be used by the Logger instance.
 * @param {boolean} [options.verbose=false] - A flag to enable or disable verbose logging.
 *
 * @method verbose
 * @param {string} message
 * @description Logs a message at the verbose level if verbose logging is enabled -v or --verbose
 *
 * also: log, error, warn, debug
 */

export class CommandLogger {
  private logger: Logger;
  private verboseFlag: boolean;

  constructor(options: CommandLoggerOptions) {
    this.logger = new Logger(options.constructorName);
    this.verboseFlag = options.verbose ?? false;
  }

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, stack?: string, context?: string) {
    this.logger.error(message, stack, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: string) {
    if (this.verboseFlag) {
      this.logger.log(message, context);
    }
  }
}
