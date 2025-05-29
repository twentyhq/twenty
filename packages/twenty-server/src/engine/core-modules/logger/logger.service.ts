import {
  Inject,
  Injectable,
  LogLevel,
  LoggerService as LoggerServiceInterface,
} from '@nestjs/common';

import { LOGGER_DRIVER } from 'src/engine/core-modules/logger/logger.constants';

@Injectable()
export class LoggerService implements LoggerServiceInterface {
  constructor(@Inject(LOGGER_DRIVER) private driver: LoggerServiceInterface) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(message: any, category: string, ...optionalParams: any[]) {
    this.driver.log.apply(this.driver, [message, category, ...optionalParams]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: any, category: string, ...optionalParams: any[]) {
    this.driver.error.apply(this.driver, [
      message,
      category,
      ...optionalParams,
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: any, category: string, ...optionalParams: any[]) {
    this.driver.warn.apply(this.driver, [message, category, ...optionalParams]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug?(message: any, category: string, ...optionalParams: any[]) {
    this.driver.debug?.apply(this.driver, [
      message,
      category,
      ...optionalParams,
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
}
