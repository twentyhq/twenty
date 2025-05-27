import { Logger } from '@nestjs/common';

interface CommandLoggerOptions {
  verbose?: boolean;
  constructorName: string;
}

export const isCommandLogger = (
  logger: Logger | CommandLogger,
): logger is CommandLogger => {
  // @ts-expect-error legacy noImplicitAny
  return typeof logger['setVerbose'] === 'function';
};

export class CommandLogger {
  private logger: Logger;
  private verboseFlag: boolean;

  constructor(options: CommandLoggerOptions) {
    this.logger = new Logger(options.constructorName);
    this.verboseFlag = options.verbose ?? false;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verbose(message: string, ...optionalParams: [...any, string?]) {
    if (this.verboseFlag) {
      this.logger.log(message, ...optionalParams);
    }
  }

  setVerbose(flag: boolean) {
    this.verboseFlag = flag;
  }
}
