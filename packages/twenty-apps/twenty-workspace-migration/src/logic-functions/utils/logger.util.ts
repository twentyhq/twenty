const LOG_PREFIX = '[twenty-workspace-migration]';

export const logger = {
  log: (message: string, ...args: unknown[]): void => {
    console.log(`${LOG_PREFIX} ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`${LOG_PREFIX} ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`${LOG_PREFIX} ${message}`, ...args);
  },
};
