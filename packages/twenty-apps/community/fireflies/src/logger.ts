export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export type LoggerConfig = {
  logLevel: LogLevel;
  isTestEnvironment: boolean;
};

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

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

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(`[${this.context}] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(`[${this.context}] ${message}`, ...args);
    }
  }

  // For fatal errors, security issues, or data corruption - always visible
  critical(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.error(`[${this.context}] CRITICAL: ${message}`, ...args);
  }
}

export const createLogger = (context: string): AppLogger => {
  return new AppLogger(context);
};

