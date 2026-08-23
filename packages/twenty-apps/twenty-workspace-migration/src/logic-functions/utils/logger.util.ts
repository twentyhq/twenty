const LOG_PREFIX = '[twenty-workspace-migration]';

// A front component can't read this app's own kv store directly, so a status route surfaces a
// recent tail of log lines through here instead. Capped since it rides along in every
// checkpoint once migration-state.util.ts persists it.
const MAX_STORED_LOG_LINES = 300;

let recentLogs: string[] = [];

export const getRecentLogs = (): string[] => recentLogs;

// Called by migration-state.util.ts when a checkpoint is loaded, so a resumed invocation's log
// tail continues from where the previous one left off instead of starting over empty.
export const setRecentLogs = (logs: string[]): void => {
  recentLogs = logs.slice(-MAX_STORED_LOG_LINES);
};

const timestamp = (): string => new Date().toISOString();

const emit = (
  consoleMethod: (message: string, ...args: unknown[]) => void,
  level: 'INFO' | 'WARN' | 'ERROR',
  message: string,
  args: unknown[],
): void => {
  const line = `${timestamp()} ${LOG_PREFIX} ${message}`;
  consoleMethod(line, ...args);

  const storedLine = args.length > 0 ? `${level} ${line} ${args.map((arg) => String(arg)).join(' ')}` : `${level} ${line}`;
  recentLogs = recentLogs.length >= MAX_STORED_LOG_LINES ? [...recentLogs.slice(1), storedLine] : [...recentLogs, storedLine];
};

export const logger = {
  log: (message: string, ...args: unknown[]): void => emit(console.log, 'INFO', message, args),
  warn: (message: string, ...args: unknown[]): void => emit(console.warn, 'WARN', message, args),
  error: (message: string, ...args: unknown[]): void => emit(console.error, 'ERROR', message, args),
};
