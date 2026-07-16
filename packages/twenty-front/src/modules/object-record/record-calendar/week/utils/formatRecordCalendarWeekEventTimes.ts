import { getRecordCalendarDateTimeRange } from '@/object-record/record-calendar/utils/getRecordCalendarDateTimeRange';
import { formatInTimeZone } from 'date-fns-tz';

type FormatRecordCalendarWeekEventTimesArgs = {
  endDateTime?: unknown;
  startDateTime: unknown;
  timeFormat: string;
  timeZone: string;
};

export type RecordCalendarWeekEventTimes = {
  startTime: string;
  timeRange: string;
};

export const formatRecordCalendarWeekEventTimes = ({
  endDateTime,
  startDateTime,
  timeFormat,
  timeZone,
}: FormatRecordCalendarWeekEventTimesArgs): RecordCalendarWeekEventTimes | null => {
  const range = getRecordCalendarDateTimeRange({
    endDateTime,
    startDateTime,
    timeZone,
  });

  if (range === null) {
    return null;
  }

  const startTime = formatInTimeZone(
    range.start.epochMilliseconds,
    timeZone,
    timeFormat,
  );

  if (range.isEndDateTimeFallback) {
    return { startTime, timeRange: startTime };
  }

  const endTime = formatInTimeZone(
    range.end.epochMilliseconds,
    timeZone,
    timeFormat,
  );

  return { startTime, timeRange: `${startTime} - ${endTime}` };
};
