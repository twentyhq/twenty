import { isString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';

import { LOG_CONSOLE_TIME_RANGE_PRESETS } from '@/log-console/constants/LogConsoleTimeRangePresets';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';

export const isLogConsoleTimeRangeWithinRetention = ({
  timeRange,
  retentionInDays,
}: {
  timeRange: LogConsoleTimeRange;
  retentionInDays: number;
}) => {
  if (
    !isString(timeRange) ||
    timeRange === 'today' ||
    timeRange === 'yesterday'
  ) {
    return true;
  }

  return (
    Temporal.Duration.compare(
      LOG_CONSOLE_TIME_RANGE_PRESETS[timeRange].duration,
      { days: retentionInDays },
    ) <= 0
  );
};
