import { isPast } from 'date-fns';

import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { getCalendarEventEndDate } from '@/activities/calendar/utils/getCalendarEventEndDate';

export const hasCalendarEventEnded = (
  calendarEvent: Pick<CalendarEvent, 'endsAt' | 'isFullDay' | 'startsAt'>,
) => isPast(getCalendarEventEndDate(calendarEvent));
