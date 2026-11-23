import { CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY } from '@/activities/calendar/constants/CalendarEventRecurrenceWeekdaysFromSunday';
import { Temporal } from 'temporal-polyfill';

export const getCalendarEventRecurrenceWeekdayOfDate = (date: string) =>
  CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY[
    Temporal.PlainDate.from(date).dayOfWeek % 7
  ];
