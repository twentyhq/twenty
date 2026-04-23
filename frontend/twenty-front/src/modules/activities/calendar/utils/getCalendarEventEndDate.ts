import { endOfDay } from 'date-fns';

import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';

export const getCalendarEventEndDate = (
  calendarEvent: Pick<CalendarEvent, 'endsAt' | 'isFullDay' | 'startsAt'>,
) =>
  calendarEvent.endsAt
    ? new Date(calendarEvent.endsAt)
    : endOfDay(getCalendarEventStartDate(calendarEvent));
