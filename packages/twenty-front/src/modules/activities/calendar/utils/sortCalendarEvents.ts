import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { getCalendarEventEndDate } from '@/activities/calendar/utils/getCalendarEventEndDate';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { sortAsc } from '~/utils/sort';

export const sortCalendarEventsAsc = (
  calendarEventA: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'>,
  calendarEventB: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'>,
) => {
  const startsAtSort = sortAsc(
    getCalendarEventStartDate(calendarEventA).getTime(),
    getCalendarEventStartDate(calendarEventB).getTime(),
  );

  if (startsAtSort !== 0) return startsAtSort;

  return sortAsc(
    getCalendarEventEndDate(calendarEventA).getTime(),
    getCalendarEventEndDate(calendarEventB).getTime(),
  );
};

export const sortCalendarEventsDesc = (
  calendarEventA: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'>,
  calendarEventB: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'>,
) => -sortCalendarEventsAsc(calendarEventA, calendarEventB);
