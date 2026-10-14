import { type LogConsoleAppAnalyticsRangePreset } from '@/log-console/types/LogConsoleAppAnalyticsRangePreset';

export type LogConsoleAppAnalyticsRange =
  | { kind: 'preset'; preset: LogConsoleAppAnalyticsRangePreset }
  | { kind: 'custom'; startDate: string; endDate: string };
