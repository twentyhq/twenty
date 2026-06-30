import { getYear, startOfDay, startOfMonth } from 'date-fns';

import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { type TimelineCalendarEvent } from '~/generated/graphql';
import { groupArrayItemsBy } from '~/utils/array/groupArrayItemsBy';
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

  return {
    calendarEventsByDayTime,
    daysByMonthTime,
    monthTimes: sortedMonthTimes,
    monthTimesByYear,
  };
};
