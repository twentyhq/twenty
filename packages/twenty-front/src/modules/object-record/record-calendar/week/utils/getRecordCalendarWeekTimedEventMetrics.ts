import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import { Temporal } from 'temporal-polyfill';

type GetRecordCalendarWeekTimedEventMetricsArgs = {
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

const getTimeOfDayInPixels = (dateTime: Temporal.ZonedDateTime) =>
  (dateTime.hour + dateTime.minute / 60 + dateTime.second / 3600) *
  RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight;

export const getRecordCalendarWeekTimedEventMetrics = ({
  endDateTime,
  startDateTime,
  timeZone,
}: GetRecordCalendarWeekTimedEventMetricsArgs): RecordCalendarWeekTimedEventMetrics | null => {
  const start = getZonedDateTimeFromValue(startDateTime, timeZone);

  if (start === null) {
    return null;
  }

  const startInPixels = getTimeOfDayInPixels(start);
  const end = getZonedDateTimeFromValue(endDateTime, timeZone);

  let endInPixels = startInPixels + RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight;

  if (
    end !== null &&
    Temporal.Instant.compare(end.toInstant(), start.toInstant()) > 0
  ) {
    const dayComparison = Temporal.PlainDate.compare(
      end.toPlainDate(),
      start.toPlainDate(),
    );

    if (dayComparison > 0) {
      endInPixels = RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight;
    } else if (dayComparison === 0) {
      const configuredEndInPixels = getTimeOfDayInPixels(end);

      if (configuredEndInPixels > startInPixels) {
        endInPixels = configuredEndInPixels;
      }
    }
  }

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
