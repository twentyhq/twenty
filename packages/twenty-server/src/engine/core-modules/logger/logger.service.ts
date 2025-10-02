import {
  ConsoleLogger,
  Inject,
  Injectable,
  type LogLevel,
  LoggerService as LoggerServiceInterface,
} from '@nestjs/common';

import { LOGGER_DRIVER } from 'src/engine/core-modules/logger/logger.constants';

type LoggerDriverType = ConsoleLogger & {
  options?: {
    logLevels?: LogLevel[];
  };
};

@Injectable()
export class LoggerService implements LoggerServiceInterface {
  constructor(@Inject(LOGGER_DRIVER) private driver: LoggerDriverType) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(message: any, category: string, ...optionalParams: any[]) {
    this.driver.log.apply(this.driver, [message, category, ...optionalParams]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: any, category: string, ...optionalParams: any[]) {
    this.driver.error.apply(this.driver, [
      message,
      category,
      ...optionalParams,
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: any, category: string, ...optionalParams: any[]) {
    this.driver.warn.apply(this.driver, [message, category, ...optionalParams]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug?(message: any, category: string, ...optionalParams: any[]) {
    this.driver.debug?.apply(this.driver, [
      message,
      category,
      ...optionalParams,
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verbose?(message: any, category: string, ...optionalParams: any[]) {
    this.driver.verbose?.apply(this.driver, [
      message,
      category,
      ...optionalParams,
    ]);
  }

  setLogLevels(levels: LogLevel[]) {
    this.driver.setLogLevels?.apply(this.driver, [levels]);
  }

  time(category: string, label: string) {
    if (this.driver.options.logLevels?.includes('debug')) {
      // eslint-disable-next-line no-console
      console.time(`[${category}] ${label}`);
    }
  }

  timeEnd(category: string, label: string) {
    if (this.driver.options.logLevels?.includes('debug')) {
      // eslint-disable-next-line no-console
      console.timeEnd(`[${category}] ${label}`);
    }
  }
}
