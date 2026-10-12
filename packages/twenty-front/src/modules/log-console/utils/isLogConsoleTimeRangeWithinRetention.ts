import { Temporal } from 'temporal-polyfill';

import { LOG_CONSOLE_TIME_RANGE_PRESETS } from '@/log-console/constants/LogConsoleTimeRangePresets';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';

export const isLogConsoleTimeRangeWithinRetention = ({
  timeRange,
  retentionInHours,
}: {
  timeRange: LogConsoleTimeRange;
  retentionInHours: number;
}) => {
  if (timeRange === 'today') {
    return retentionInHours >= 24;
  }

  if (timeRange === 'yesterday') {
    return retentionInHours >= 48;
  }

  return (
    Temporal.Duration.compare(
      LOG_CONSOLE_TIME_RANGE_PRESETS[timeRange].duration,
      { hours: retentionInHours },
    ) <= 0
  );
};
