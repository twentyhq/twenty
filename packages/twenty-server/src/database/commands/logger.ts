import { Logger } from '@nestjs/common';

interface CommandLoggerOptions {
  verbose?: boolean;
  constructorName: string;
}

export class CommandLogger {
  private logger: Logger;

  constructor(options: CommandLoggerOptions) {
    this.logger = new Logger(options.constructorName);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(message: string, ...optionalParams: [...any, string?]) {
    this.logger.log(message, ...optionalParams);
  }

  error(message: string, stack?: string, context?: string) {
    this.logger.error(message, stack, context);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, ...optionalParams: [...any, string?]) {
    this.logger.warn(message, ...optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: string, ...optionalParams: [...any, string?]) {
    this.logger.debug(message, ...optionalParams);
  }
}
