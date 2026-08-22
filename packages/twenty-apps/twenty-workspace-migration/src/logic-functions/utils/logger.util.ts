const LOG_PREFIX = '[twenty-workspace-migration]';

export const logger = {
  log: (message: string, ...args: unknown[]): void => {
    console.log(`${Date.now()} ${LOG_PREFIX} ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`${Date.now()} ${LOG_PREFIX} ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`${Date.now()} ${LOG_PREFIX} ${message}`, ...args);
  },
};
