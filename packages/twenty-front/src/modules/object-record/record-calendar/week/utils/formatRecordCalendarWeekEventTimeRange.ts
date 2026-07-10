import { getRecordCalendarDateTimeRange } from '@/object-record/record-calendar/utils/getRecordCalendarDateTimeRange';
import { formatInTimeZone } from 'date-fns-tz';

type FormatRecordCalendarWeekEventTimeRangeArgs = {
  endDateTime?: unknown;
  startDateTime: unknown;
  timeFormat: string;
  timeZone: string;
};

export const formatRecordCalendarWeekEventTimeRange = ({
  endDateTime,
  startDateTime,
  timeFormat,
  timeZone,
}: FormatRecordCalendarWeekEventTimeRangeArgs) => {
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
  const endTime = formatInTimeZone(
    range.end.epochMilliseconds,
    timeZone,
    timeFormat,
  );

  return `${startTime} - ${endTime}`;
};
