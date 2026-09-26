import { startOfDay } from 'date-fns';

import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import {
  turnJSDateToPlainDate,
  turnPlainDateToShiftedDateInSystemTimeZone,
} from 'twenty-shared/utils';
import { type TimelineCalendarEvent } from '~/generated/graphql';
import { groupArrayItemsBy } from '~/utils/array/groupArrayItemsBy';
import { sortDesc } from '~/utils/sort';

export const useCalendarEvents = (
  calendarEvents: TimelineCalendarEvent[],
  calendarSystem: CalendarSystem,
) => {
  const toCalendarPlainDate = (time: number) =>
    turnJSDateToPlainDate(new Date(time)).withCalendar(calendarSystem);

  const calendarEventsByDayTime = groupArrayItemsBy(
    calendarEvents,
    (calendarEvent) =>
      startOfDay(getCalendarEventStartDate(calendarEvent)).getTime(),
  );

  const sortedDayTimes = Object.keys(calendarEventsByDayTime)
    .map(Number)
    .sort(sortDesc);

  const daysByMonthTime = groupArrayItemsBy(sortedDayTimes, (dayTime) =>
    turnPlainDateToShiftedDateInSystemTimeZone(
      toCalendarPlainDate(dayTime).with({ day: 1 }),
    ).getTime(),
  );

  const sortedMonthTimes = Object.keys(daysByMonthTime)
    .map(Number)
    .sort(sortDesc);

  const monthTimesByYear = groupArrayItemsBy(
    sortedMonthTimes,
    (monthTime) => toCalendarPlainDate(monthTime).year,
  );

  return {
    calendarEventsByDayTime,
    daysByMonthTime,
    monthTimes: sortedMonthTimes,
    monthTimesByYear,
  };
};
