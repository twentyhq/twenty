import { getYear, isThisMonth, startOfDay, startOfMonth } from 'date-fns';
import { useMemo, useState } from 'react';

import { findUpcomingCalendarEvent } from '@/activities/calendar/utils/findUpcomingCalendarEvent';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { TimelineCalendarEvent } from '~/generated/graphql';
import { groupArrayItemsBy } from '~/utils/array/groupArrayItemsBy';
import { isDefined } from '~/utils/isDefined';
import { sortDesc } from '~/utils/sort';

export const useCalendarEvents = (calendarEvents: TimelineCalendarEvent[]) => {
  const calendarEventsByDayTime = groupArrayItemsBy(
    calendarEvents,
    (calendarEvent) =>
      startOfDay(getCalendarEventStartDate(calendarEvent)).getTime(),
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

  const getPreviousCalendarEvent = (calendarEvent: TimelineCalendarEvent) => {
    const calendarEventIndex = calendarEvents.indexOf(calendarEvent);
    return calendarEventIndex < calendarEvents.length - 1
      ? calendarEvents[calendarEventIndex + 1]
      : undefined;
  };

  const getNextCalendarEvent = (calendarEvent: TimelineCalendarEvent) => {
    const calendarEventIndex = calendarEvents.indexOf(calendarEvent);
    return calendarEventIndex > 0
      ? calendarEvents[calendarEventIndex - 1]
      : undefined;
  };

  const initialUpcomingCalendarEvent = useMemo(
    () => findUpcomingCalendarEvent(calendarEvents),
    [calendarEvents],
  );
  const lastEventInCalendar = calendarEvents.length
    ? calendarEvents[0]
    : undefined;

  const [currentCalendarEvent, setCurrentCalendarEvent] = useState(
    (initialUpcomingCalendarEvent &&
      (isThisMonth(getCalendarEventStartDate(initialUpcomingCalendarEvent))
        ? initialUpcomingCalendarEvent
        : getPreviousCalendarEvent(initialUpcomingCalendarEvent))) ||
      lastEventInCalendar,
  );

  const updateCurrentCalendarEvent = () => {
    if (!currentCalendarEvent) return;

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
