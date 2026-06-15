import {
  ConsoleLogger,
  Inject,
  Injectable,
  type LogLevel,
  LoggerService as LoggerServiceInterface,
} from '@nestjs/common';

import { LOGGER_DRIVER } from 'src/engine/core-modules/logger/logger.constants';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type LoggerDriverType = ConsoleLogger & {
  options?: {
    logLevels?: LogLevel[];
  };
};

@Injectable()
export class LoggerService implements LoggerServiceInterface {
  // Tracks active perfTime() spans by `${category}::${label}` so perfTimeEnd()
  // can emit the elapsed duration through the driver.
  private readonly perfTimers = new Map<string, number>();

  constructor(
    @Inject(LOGGER_DRIVER) private driver: LoggerDriverType,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  private isPerfLoggingEnabled() {
    return this.twentyConfigService.get('PERF_LOG_ENABLED');
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  log(message: any, category: string, ...optionalParams: any[]) {
    this.driver.log.apply(this.driver, [message, category, ...optionalParams]);
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  error(message: any, category: string, ...optionalParams: any[]) {
    this.driver.error.apply(this.driver, [
      message,
      category,
      ...optionalParams,
    ]);
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  warn(message: any, category: string, ...optionalParams: any[]) {
    this.driver.warn.apply(this.driver, [message, category, ...optionalParams]);
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  debug?(message: any, category: string, ...optionalParams: any[]) {
    this.driver.debug?.apply(this.driver, [
      message,
      category,
      ...optionalParams,
    ]);
  }

  // oxlint-disable-next-line typescript/no-explicit-any
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

  // Performance instrumentation, gated by PERF_LOG_ENABLED so it can be muted
  // (e.g. in integration tests) while staying on by default everywhere else.

  // oxlint-disable-next-line typescript/no-explicit-any
  perf(message: any, category: string, ...optionalParams: any[]) {
    if (!this.isPerfLoggingEnabled()) {
      return;
    }

    this.driver.log.apply(this.driver, [message, category, ...optionalParams]);
  }

  perfTime(category: string, label: string) {
    if (!this.isPerfLoggingEnabled()) {
      return;
    }

    this.perfTimers.set(`${category}::${label}`, performance.now());
  }

  perfTimeEnd(category: string, label: string) {
    if (!this.isPerfLoggingEnabled()) {
      return;
    }

    const key = `${category}::${label}`;
    const startedAt = this.perfTimers.get(key);

    if (startedAt === undefined) {
      return;
    }

    this.perfTimers.delete(key);

    const durationMs = performance.now() - startedAt;

    this.driver.log.apply(this.driver, [
      `${label}: ${durationMs.toFixed(1)}ms`,
      category,
    ]);
  }
}
