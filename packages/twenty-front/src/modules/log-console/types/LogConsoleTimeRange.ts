import { type LogConsoleTimeRangePreset } from '@/log-console/types/LogConsoleTimeRangePreset';

export type LogConsoleTimeRange =
  | LogConsoleTimeRangePreset
  | 'today'
  | 'yesterday';
