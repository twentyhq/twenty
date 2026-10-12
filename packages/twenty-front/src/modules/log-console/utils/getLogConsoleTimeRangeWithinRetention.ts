import { typedObjectEntries } from 'twenty-shared/utils';

import { LOG_CONSOLE_TIME_RANGE_PRESETS } from '@/log-console/constants/LogConsoleTimeRangePresets';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';
import { isLogConsoleTimeRangeWithinRetention } from '@/log-console/utils/isLogConsoleTimeRangeWithinRetention';

export const getLogConsoleTimeRangeWithinRetention = ({
  timeRange,
  retentionInHours,
}: {
  timeRange: LogConsoleTimeRange;
  retentionInHours: number;
}): LogConsoleTimeRange => {
  if (isLogConsoleTimeRangeWithinRetention({ timeRange, retentionInHours })) {
    return timeRange;
  }

  const presetsWithinRetention = typedObjectEntries(
    LOG_CONSOLE_TIME_RANGE_PRESETS,
  )
    .map(([preset]) => preset)
    .filter((preset) =>
      isLogConsoleTimeRangeWithinRetention({
        timeRange: preset,
        retentionInHours,
      }),
    );

  return presetsWithinRetention.at(-1) ?? '15m';
};
