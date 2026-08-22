const LOG_PREFIX = '[twenty-workspace-migration]';

const timestamp = (): string => new Date().toISOString();

export const logger = {
  log: (message: string, ...args: unknown[]): void => {
    console.log(`${timestamp()} ${LOG_PREFIX} ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`${timestamp()} ${LOG_PREFIX} ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`${timestamp()} ${LOG_PREFIX} ${message}`, ...args);
  },
};
