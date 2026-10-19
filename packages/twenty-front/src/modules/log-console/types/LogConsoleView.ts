import { type LogConsoleFilter } from '@/log-console/types/LogConsoleFilter';
import { type LogConsoleSourceId } from '@/log-console/types/LogConsoleSourceId';

export type LogConsoleView = {
  sourceId: LogConsoleSourceId;
  filters: LogConsoleFilter[];
};
