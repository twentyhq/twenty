import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const CALL_RECORDING_FALLBACK_TITLE = 'Call recording';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const resolveCallRecordingTitle = (
  calendarEvent: Pick<CalendarEventRecord, 'startsAt' | 'title'>,
): string => {
  if (isNonEmptyString(calendarEvent.title)) {
    return calendarEvent.title.trim();
  }

  const formattedCalendarEventStartDateTime =
    formatCalendarEventStartDateTimeForFallbackTitle(calendarEvent.startsAt);

  return isNonEmptyString(formattedCalendarEventStartDateTime)
    ? `${CALL_RECORDING_FALLBACK_TITLE} - ${formattedCalendarEventStartDateTime}`
    : CALL_RECORDING_FALLBACK_TITLE;
};

const formatCalendarEventStartDateTimeForFallbackTitle = (
  calendarEventStartsAt: string | undefined,
): string | undefined => {
  if (!isNonEmptyString(calendarEventStartsAt)) {
    return undefined;
  }

  const calendarEventStartDate = new Date(calendarEventStartsAt);

  if (Number.isNaN(calendarEventStartDate.getTime())) {
    return undefined;
  }

  const monthLabel = MONTH_LABELS[calendarEventStartDate.getUTCMonth()];
  const dayOfMonth = calendarEventStartDate.getUTCDate();
  const year = calendarEventStartDate.getUTCFullYear();
  const hourOfDay = calendarEventStartDate.getUTCHours();
  const hourWithinHalfDay = hourOfDay % 12 === 0 ? 12 : hourOfDay % 12;
  const minuteLabel = calendarEventStartDate
    .getUTCMinutes()
    .toString()
    .padStart(2, '0');
  const meridiemLabel = hourOfDay < 12 ? 'AM' : 'PM';

  return `${monthLabel} ${dayOfMonth}, ${year}, ${hourWithinHalfDay}:${minuteLabel} ${meridiemLabel} UTC`;
};
