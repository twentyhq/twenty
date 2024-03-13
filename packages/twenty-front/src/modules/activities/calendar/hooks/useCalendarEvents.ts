import { useMemo, useState } from 'react';
import { getYear, isThisMonth, startOfDay, startOfMonth } from 'date-fns';

import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { findUpcomingCalendarEvent } from '@/activities/calendar/utils/findUpcomingCalendarEvent';
import { groupArrayItemsBy } from '~/utils/array/groupArrayItemsBy';
import { isDefined } from '~/utils/isDefined';
import { sortDesc } from '~/utils/sort';

export const useCalendarEvents = (calendarEvents: CalendarEvent[]) => {
  const calendarEventsByDayTime = groupArrayItemsBy(
    calendarEvents,
    ({ startsAt }) => startOfDay(startsAt).getTime(),
  );

  const sortedDayTimes = Object.keys(calendarEventsByDayTime)
    .map(Number)
    .sort(sortDesc);

  const daysByMonthTime = groupArrayItemsBy(sortedDayTimes, (dayTime) =>
    startOfMonth(dayTime).getTime(),
  );

  const sortedMonthTimes = Object.keys(daysByMonthTime)
    .map(Number)
    .sort(sortDesc);

  const monthTimesByYear = groupArrayItemsBy(sortedMonthTimes, getYear);

  const getPreviousCalendarEvent = (calendarEvent: CalendarEvent) => {
    const calendarEventIndex = calendarEvents.indexOf(calendarEvent);
    return calendarEventIndex < calendarEvents.length - 1
      ? calendarEvents[calendarEventIndex + 1]
      : undefined;
  };

  const getNextCalendarEvent = (calendarEvent: CalendarEvent) => {
    const calendarEventIndex = calendarEvents.indexOf(calendarEvent);
    return calendarEventIndex > 0
      ? calendarEvents[calendarEventIndex - 1]
      : undefined;
  };

  const initialUpcomingCalendarEvent = useMemo(
    () => findUpcomingCalendarEvent(calendarEvents),
    [calendarEvents],
  );
  const lastEventInCalendar = calendarEvents[0];

  const [currentCalendarEvent, setCurrentCalendarEvent] = useState(
    (initialUpcomingCalendarEvent &&
      (isThisMonth(initialUpcomingCalendarEvent.startsAt)
        ? initialUpcomingCalendarEvent
        : getPreviousCalendarEvent(initialUpcomingCalendarEvent))) ||
      lastEventInCalendar,
  );

  const updateCurrentCalendarEvent = () => {
    const nextCurrentCalendarEvent = getNextCalendarEvent(currentCalendarEvent);

    if (isDefined(nextCurrentCalendarEvent)) {
      setCurrentCalendarEvent(nextCurrentCalendarEvent);
    }
  };

  return {
    calendarEventsByDayTime,
    currentCalendarEvent,
    daysByMonthTime,
    getNextCalendarEvent,
    monthTimes: sortedMonthTimes,
    monthTimesByYear,
    updateCurrentCalendarEvent,
  };
};
