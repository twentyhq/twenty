import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { sortAsc } from '~/utils/sort';

export const sortCalendarEventsAsc = (
  calendarEventA: Pick<CalendarEvent, 'startsAt' | 'endsAt'>,
  calendarEventB: Pick<CalendarEvent, 'startsAt' | 'endsAt'>,
) => {
  const startsAtSort = sortAsc(
    calendarEventA.startsAt.getTime(),
    calendarEventB.startsAt.getTime(),
  );

  if (startsAtSort === 0 && calendarEventA.endsAt && calendarEventB.endsAt) {
    return sortAsc(
      calendarEventA.endsAt.getTime(),
      calendarEventB.endsAt.getTime(),
    );
  }

  return startsAtSort;
};

export const sortCalendarEventsDesc = (
  calendarEventA: Pick<CalendarEvent, 'startsAt' | 'endsAt'>,
  calendarEventB: Pick<CalendarEvent, 'startsAt' | 'endsAt'>,
) => -sortCalendarEventsAsc(calendarEventA, calendarEventB);
