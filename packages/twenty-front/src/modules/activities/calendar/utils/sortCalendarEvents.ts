import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { getCalendarEventEndDate } from '@/activities/calendar/utils/getCalendarEventEndDate';
import { sortAsc } from '~/utils/sort';

export const sortCalendarEventsAsc = (
  calendarEventA: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'>,
  calendarEventB: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'>,
) => {
  const startsAtSort = sortAsc(
    calendarEventA.startsAt.getTime(),
    calendarEventB.startsAt.getTime(),
  );

  if (startsAtSort === 0) {
    const endsAtA = getCalendarEventEndDate(calendarEventA);
    const endsAtB = getCalendarEventEndDate(calendarEventB);

    return sortAsc(endsAtA.getTime(), endsAtB.getTime());
  }

  return startsAtSort;
};

export const sortCalendarEventsDesc = (
  calendarEventA: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'>,
  calendarEventB: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'>,
) => -sortCalendarEventsAsc(calendarEventA, calendarEventB);
