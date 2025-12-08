export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export type LoggerConfig = {
  logLevel: LogLevel;
  isTestEnvironment: boolean;
  captureForResponse: boolean;
};

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const loggerRegistry = new Set<AppLogger>();

export class AppLogger {
  private config: LoggerConfig;
  private context: string;
  private capturedLogs: string[] = [];

  constructor(context: string) {
    this.context = context;
    this.config = {
      logLevel: this.parseLogLevel(process.env.LOG_LEVEL || 'error'),
      isTestEnvironment: process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined,
      captureForResponse: process.env.CAPTURE_LOGS === 'true',
    };

    // Silence logs in test environment unless explicitly overridden
    if (this.config.isTestEnvironment && process.env.LOG_LEVEL === undefined) {
      this.config.logLevel = 'silent';
    }
  }

  private parseLogLevel(level: string): LogLevel {
    const normalizedLevel = level.toLowerCase() as LogLevel;
    return Object.keys(LOG_LEVELS).includes(normalizedLevel) ? normalizedLevel : 'error';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.logLevel];
  }

  private safeStringify(value: unknown): string {
    try {
      if (typeof value === 'string') return value;
      return JSON.stringify(value);
    } catch {
      return '[unserializable]';
    }
  }

  private captureLog(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.config.captureForResponse) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMessage =
      args.length > 0
        ? `${message} ${args.map((arg) => this.safeStringify(arg)).join(' ')}`
        : message;

    this.capturedLogs.push(
      `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${formattedMessage}`,
    );
  }

  debug(message: string, ...args: unknown[]): void {
    this.captureLog('debug', message, ...args);
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    this.captureLog('info', message, ...args);
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    this.captureLog('warn', message, ...args);
    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(`[${this.context}] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    this.captureLog('error', message, ...args);
    if (this.shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(`[${this.context}] ${message}`, ...args);
    }
  }

  // For fatal errors, security issues, or data corruption - always visible
  critical(message: string, ...args: unknown[]): void {
    this.captureLog('error', `CRITICAL: ${message}`, ...args);
    // eslint-disable-next-line no-console
    console.error(`[${this.context}] CRITICAL: ${message}`, ...args);
  }

  getCapturedLogs(): string[] {
    return [...this.capturedLogs];
  }

  clearCapturedLogs(): void {
    this.capturedLogs = [];
  }
}

export const createLogger = (context: string): AppLogger => {
  const logger = new AppLogger(context);
  loggerRegistry.add(logger);
  return logger;
};

export const removeLogger = (logger: AppLogger): void => {
  loggerRegistry.delete(logger);
};

export const getAllCapturedLogs = (): string[] => {
  const allLogs: string[] = [];
  for (const logger of loggerRegistry) {
    allLogs.push(...logger.getCapturedLogs());
  }
  return allLogs.sort();
};

export const clearAllCapturedLogs = (): void => {
  for (const logger of loggerRegistry) {
    logger.clearCapturedLogs();
  }
};
