import { CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY } from '@/activities/calendar/constants/CalendarEventRecurrenceWeekdaysFromSunday';
import { Temporal } from 'temporal-polyfill';

export const getCalendarEventRecurrenceWeekdayOfDate = (date: string) => {
  const weekdayIndexFromSunday = Temporal.PlainDate.from(date).dayOfWeek % 7;

  return CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY[weekdayIndexFromSunday];
};
