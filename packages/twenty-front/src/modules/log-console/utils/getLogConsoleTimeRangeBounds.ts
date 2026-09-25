import { isString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';

import { LOG_CONSOLE_TIME_RANGE_PRESETS } from '@/log-console/constants/LogConsoleTimeRangePresets';
import { type LogConsoleTimeRange } from '@/log-console/types/LogConsoleTimeRange';

export const getLogConsoleTimeRangeBounds = ({
  timeRange,
  now,
  timeZone,
}: {
  timeRange: LogConsoleTimeRange;
  now: string;
  timeZone: string;
}): { start: string; end?: string } => {
  if (!isString(timeRange)) {
    return timeRange;
  }

  const zonedNow = Temporal.Instant.from(now).toZonedDateTimeISO(timeZone);
  const startOfToday = zonedNow.startOfDay();

  switch (timeRange) {
    case 'today':
      return { start: startOfToday.toInstant().toString() };
    case 'yesterday':
      return {
        start: startOfToday.subtract({ days: 1 }).toInstant().toString(),
        end: startOfToday.toInstant().toString(),
      };
    default:
      return {
        start: zonedNow
          .subtract(LOG_CONSOLE_TIME_RANGE_PRESETS[timeRange].duration)
          .toInstant()
          .toString(),
      };
  }
};
