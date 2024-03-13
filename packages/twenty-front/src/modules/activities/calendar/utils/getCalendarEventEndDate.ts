import { endOfDay } from 'date-fns';

import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';

export const getCalendarEventEndDate = (
  calendarEvent: Pick<CalendarEvent, 'endsAt' | 'isFullDay' | 'startsAt'>,
) => calendarEvent.endsAt ?? endOfDay(calendarEvent.startsAt);
