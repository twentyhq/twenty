import { Temporal } from 'temporal-polyfill';

type GetRecordCalendarDateTimeRangeArgs = {
  endDateTime?: unknown;
  startDateTime: unknown;
  timeZone: string;
};

export type RecordCalendarDateTimeRange = {
  end: Temporal.ZonedDateTime;
  isEndDateTimeFallback: boolean;
  start: Temporal.ZonedDateTime;
};

const getZonedDateTimeFromValue = (value: unknown, timeZone: string) => {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    return Temporal.Instant.from(value).toZonedDateTimeISO(timeZone);
  } catch {
    return null;
  }
};

export const getRecordCalendarDateTimeRange = ({
  endDateTime,
  startDateTime,
  timeZone,
}: GetRecordCalendarDateTimeRangeArgs): RecordCalendarDateTimeRange | null => {
  const start = getZonedDateTimeFromValue(startDateTime, timeZone);

  if (start === null) {
    return null;
  }

  const configuredEnd = getZonedDateTimeFromValue(endDateTime, timeZone);
  const isEndDateTimeFallback =
    configuredEnd === null ||
    Temporal.Instant.compare(configuredEnd.toInstant(), start.toInstant()) <= 0;
  const end = isEndDateTimeFallback ? start.add({ hours: 1 }) : configuredEnd;

  return { end, isEndDateTimeFallback, start };
};
