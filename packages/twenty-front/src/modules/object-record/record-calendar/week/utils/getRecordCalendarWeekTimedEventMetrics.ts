import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import { getRecordCalendarDateTimeRange } from '@/object-record/record-calendar/utils/getRecordCalendarDateTimeRange';
import { Temporal } from 'temporal-polyfill';

type GetRecordCalendarWeekTimedEventMetricsArgs = {
  day: Temporal.PlainDate;
  endDateTime?: unknown;
  startDateTime: unknown;
  timeZone: string;
};

export type RecordCalendarWeekTimedEventMetrics = {
  endInPixels: number;
  startInPixels: number;
};

export const getRecordCalendarWeekTimedEventHeight = ({
  endInPixels,
  startInPixels,
}: RecordCalendarWeekTimedEventMetrics) =>
  Math.max(
    RECORD_CALENDAR_WEEK_DIMENSIONS.minimumEventSlotHeight,
    endInPixels -
      startInPixels -
      RECORD_CALENDAR_WEEK_DIMENSIONS.eventVerticalGap,
  );

const getTimeOfDayInPixels = (dateTime: Temporal.ZonedDateTime) =>
  (dateTime.hour + dateTime.minute / 60 + dateTime.second / 3600) *
  RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight;

export const getRecordCalendarWeekTimedEventMetrics = ({
  day,
  endDateTime,
  startDateTime,
  timeZone,
}: GetRecordCalendarWeekTimedEventMetricsArgs): RecordCalendarWeekTimedEventMetrics | null => {
  const range = getRecordCalendarDateTimeRange({
    endDateTime,
    startDateTime,
    timeZone,
  });

  if (range === null) {
    return null;
  }

  const dayStart = day.toZonedDateTime({ timeZone });
  const nextDayStart = day.add({ days: 1 }).toZonedDateTime({ timeZone });

  if (
    Temporal.Instant.compare(
      range.start.toInstant(),
      nextDayStart.toInstant(),
    ) >= 0 ||
    Temporal.Instant.compare(range.end.toInstant(), dayStart.toInstant()) <= 0
  ) {
    return null;
  }

  const startInPixels =
    Temporal.Instant.compare(range.start.toInstant(), dayStart.toInstant()) <= 0
      ? 0
      : getTimeOfDayInPixels(range.start);
  let endInPixels =
    Temporal.Instant.compare(range.end.toInstant(), nextDayStart.toInstant()) >=
    0
      ? RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight
      : getTimeOfDayInPixels(range.end);

  endInPixels = Math.min(
    RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight,
    Math.max(
      endInPixels,
      startInPixels + RECORD_CALENDAR_WEEK_DIMENSIONS.minimumEventSlotHeight,
    ),
  );

  return {
    endInPixels,
    startInPixels,
  };
};
