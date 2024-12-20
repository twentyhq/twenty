import { Logger } from '@nestjs/common';

interface CommandLoggerOptions {
  verbose?: boolean;
  constructorName: string;
}

export class CommandLogger {
  private logger: Logger;
  private verbose: boolean;

  constructor(options: CommandLoggerOptions) {
    this.logger = new Logger(options.constructorName);
    this.verbose = options.verbose ?? true;
  }

  log(message: string, context?: string) {
    if (this.verbose) {
      this.logger.log(message, context);
    }
  }

  error(message: string, stack?: string, context?: string) {
    if (this.verbose) {
      this.logger.error(message, stack, context);
    }
  }

  warn(message: string, context?: string) {
    if (this.verbose) {
      this.logger.warn(message, context);
    }
  }

  debug(message: string, context?: string) {
    if (this.verbose) {
      this.logger.debug(message, context);
    }
  }

  verboseLog(message: string, context?: string) {
    if (this.verbose) {
      this.logger.verbose(message, context);
    }
  }
}
