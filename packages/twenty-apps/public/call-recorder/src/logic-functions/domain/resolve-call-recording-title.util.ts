import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { formatUtcDateTime } from 'src/logic-functions/utils/format-utc-date-time.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const CALL_RECORDING_FALLBACK_TITLE = 'Call recording';

export const resolveCallRecordingTitle = (
  calendarEvent: Pick<CalendarEventRecord, 'startsAt' | 'title'>,
): string => {
  if (isNonEmptyString(calendarEvent.title)) {
    return calendarEvent.title.trim();
  }

  const formattedCalendarEventStartDateTime = formatUtcDateTime(
    calendarEvent.startsAt,
  );

  return isNonEmptyString(formattedCalendarEventStartDateTime)
    ? `${CALL_RECORDING_FALLBACK_TITLE} - ${formattedCalendarEventStartDateTime}`
    : CALL_RECORDING_FALLBACK_TITLE;
};
