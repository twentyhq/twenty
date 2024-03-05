import { isPast } from 'date-fns';

import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { getCalendarEventEndDate } from '@/activities/calendar/utils/getCalendarEventEndDate';

export const isPastCalendarEvent = (
  calendarEvent: Pick<CalendarEvent, 'endsAt' | 'isFullDay' | 'startsAt'>,
) => isPast(getCalendarEventEndDate(calendarEvent));
