import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { hasCalendarEventEnded } from '@/activities/calendar/utils/hasCalendarEventEnded';
import { sortCalendarEventsAsc } from '@/activities/calendar/utils/sortCalendarEvents';

export const findUpcomingCalendarEvent = <
  T extends Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'>,
>(
  calendarEvents: T[],
) =>
  [...calendarEvents]
    .sort(sortCalendarEventsAsc)
    .find((calendarEvent) => !hasCalendarEventEnded(calendarEvent));
