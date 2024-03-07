import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { isPastCalendarEvent } from '@/activities/calendar/utils/isPastCalendarEvent';
import { sortCalendarEventsAsc } from '@/activities/calendar/utils/sortCalendarEvents';

export const findUpcomingCalendarEvent = <
  T extends Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'>,
>(
  calendarEvents: T[],
) =>
  [...calendarEvents]
    .sort(sortCalendarEventsAsc)
    .find((calendarEvent) => !isPastCalendarEvent(calendarEvent));
