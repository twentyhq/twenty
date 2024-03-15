import { isPast } from 'date-fns';

import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';

export const hasCalendarEventStarted = (
  calendarEvent: Pick<CalendarEvent, 'startsAt'>,
) => isPast(calendarEvent.startsAt);
