import { getRecordCalendarDateTimeRange } from '@/object-record/record-calendar/utils/getRecordCalendarDateTimeRange';
import { Temporal } from 'temporal-polyfill';

type IsRecordCalendarDayInDateTimeRangeArgs = {
  day: Temporal.PlainDate;
  endDateTime?: unknown;
  startDateTime: unknown;
  timeZone: string;
};

export const isRecordCalendarDayInDateTimeRange = ({
  day,
  endDateTime,
  startDateTime,
  timeZone,
}: IsRecordCalendarDayInDateTimeRangeArgs) => {
  const range = getRecordCalendarDateTimeRange({
    endDateTime,
    startDateTime,
    timeZone,
  });

  if (range === null) {
    return false;
  }

  const dayStart = day.toZonedDateTime({ timeZone }).toInstant();
  const nextDayStart = day
    .add({ days: 1 })
    .toZonedDateTime({ timeZone })
    .toInstant();

  return (
    Temporal.Instant.compare(range.start.toInstant(), nextDayStart) < 0 &&
    Temporal.Instant.compare(range.end.toInstant(), dayStart) > 0
  );
};
