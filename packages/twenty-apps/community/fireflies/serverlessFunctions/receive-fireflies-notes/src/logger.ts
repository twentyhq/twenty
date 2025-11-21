export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LoggerConfig {
  logLevel: LogLevel;
  isTestEnvironment: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

/**
 * App-level Fireflies application logger with configurable log levels.
 */
export class AppLogger {
  private config: LoggerConfig;
  private context: string;

  constructor(context: string) {
    this.context = context;
    this.config = {
      logLevel: this.parseLogLevel(process.env.LOG_LEVEL || 'error'),
      isTestEnvironment: process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined,
    };
  }

  private parseLogLevel(level: string): LogLevel {
    const normalizedLevel = level.toLowerCase() as LogLevel;
    return Object.keys(LOG_LEVELS).includes(normalizedLevel) ? normalizedLevel : 'error';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.logLevel];
  }

  /**
   * Log debug information (LOG_LEVEL=debug)
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }

  /**
   * Log informational messages (LOG_LEVEL=info or lower)
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }

  /**
   * Log warnings (LOG_LEVEL=warn or lower)
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(`[${this.context}] ${message}`, ...args);
    }
  }

  /**
   * Log errors (LOG_LEVEL=error or lower)
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(`[${this.context}] ${message}`, ...args);
    }
  }

  /**
   * Log critical errors that should ALWAYS be visible regardless of log level
   * Use sparingly - only for fatal errors, security issues, or data corruption
   */
  critical(message: string, ...args: any[]): void {
    // eslint-disable-next-line no-console
    console.error(`[${this.context}] CRITICAL: ${message}`, ...args);
  }
}

/**
 * Factory function to create loggers with automatic context detection
 */
export const createLogger = (context: string): AppLogger => {
  return new AppLogger(context);
};
