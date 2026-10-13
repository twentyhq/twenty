import {
  type LogConsoleEventLogSource,
  type LogConsoleSource,
} from '@/log-console/types/LogConsoleSource';

export const isLogConsoleEventLogSource = (
  source: LogConsoleSource,
): source is LogConsoleEventLogSource => 'table' in source;
