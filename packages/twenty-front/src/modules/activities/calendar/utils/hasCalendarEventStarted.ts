import { isPast } from 'date-fns';

import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';

export const hasCalendarEventStarted = (
  calendarEvent: Pick<CalendarEvent, 'startsAt'>,
) => isPast(getCalendarEventStartDate(calendarEvent));
