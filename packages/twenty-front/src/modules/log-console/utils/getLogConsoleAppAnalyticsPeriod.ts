import { Temporal } from 'temporal-polyfill';

import { LOG_CONSOLE_APP_ANALYTICS_RANGE_PRESETS } from '@/log-console/constants/LogConsoleAppAnalyticsRangePresets';
import { LOG_CONSOLE_APP_ANALYTICS_RETENTION_IN_DAYS } from '@/log-console/constants/LogConsoleAppAnalyticsRetentionInDays';
import { type LogConsoleAppAnalyticsRange } from '@/log-console/types/LogConsoleAppAnalyticsRange';

const UTC_TIME_ZONE = 'UTC';

const toUtcDayStart = (isoString: string) =>
  Temporal.Instant.from(isoString)
    .toZonedDateTimeISO(UTC_TIME_ZONE)
    .startOfDay();

const laterOf = (
  left: Temporal.ZonedDateTime,
  right: Temporal.ZonedDateTime,
) => (Temporal.ZonedDateTime.compare(left, right) > 0 ? left : right);

// Analytics are aggregated per UTC day, so every range is expressed as [UTC day start, next UTC day start)
export const getLogConsoleAppAnalyticsPeriod = ({
  range,
  now,
  registrationCreatedAt,
}: {
  range: LogConsoleAppAnalyticsRange;
  now: string;
  registrationCreatedAt: string;
}): { periodStart: string; periodEnd: string } => {
  const periodEnd =
    range.kind === 'custom'
      ? Temporal.PlainDate.from(range.endDate)
          .add({ days: 1 })
          .toZonedDateTime(UTC_TIME_ZONE)
      : toUtcDayStart(now).add({ days: 1 });

  const retentionStart = periodEnd.subtract({
    days: LOG_CONSOLE_APP_ANALYTICS_RETENTION_IN_DAYS,
  });

  const requestedStart =
    range.kind === 'custom'
      ? Temporal.PlainDate.from(range.startDate).toZonedDateTime(UTC_TIME_ZONE)
      : (() => {
          const lastDays =
            LOG_CONSOLE_APP_ANALYTICS_RANGE_PRESETS[range.preset].lastDays;

          return lastDays === undefined
            ? toUtcDayStart(registrationCreatedAt)
            : periodEnd.subtract({ days: lastDays });
        })();

  return {
    periodStart: laterOf(requestedStart, retentionStart).toInstant().toString(),
    periodEnd: periodEnd.toInstant().toString(),
  };
};
