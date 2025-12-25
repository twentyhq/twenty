import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from 'twenty-shared/constants';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import {
  addDays,
  eachWeekOfInterval,
  endOfWeek,
  format,
  startOfWeek,
} from 'date-fns';
import { useRecoilValue } from 'recoil';

import { type Temporal } from 'temporal-polyfill';
import {
  turnJSDateToPlainDate,
  turnPlainDateToShiftedDateInSystemTimeZone,
} from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

// TODO: we could refactor this to use Temporal.PlainDate directly
// But it would require recoding the utils here, not really worth it for now
export const useRecordCalendarMonthDaysRange = (
  selectedDate: Temporal.PlainDate,
) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const dateLocale = useRecoilValue(dateLocaleState);

  if (!currentWorkspaceMember) {
    throw new Error('Current workspace member not found');
  }

  const weekStartsOnDayIndex = (
    currentWorkspaceMember?.calendarStartDay === CalendarStartDay.SYSTEM
      ? CalendarStartDay[detectCalendarStartDay()]
      : (currentWorkspaceMember?.calendarStartDay ?? 0)
  ) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  const firstDayOfMonth = selectedDate.with({ day: 1 });
  const lastDayOfMonth = selectedDate
    .with({ day: 1 })
    .add({ months: 1 })
    .subtract({ days: 1 });

  const shiftedFirstDayOfMonth =
    turnPlainDateToShiftedDateInSystemTimeZone(firstDayOfMonth);

  const firstDayOfFirstWeek = turnJSDateToPlainDate(
    startOfWeek(shiftedFirstDayOfMonth, {
      weekStartsOn: weekStartsOnDayIndex,
      locale: dateLocale.localeCatalog,
    }),
  );

  const shiftedLastDayOfMonth =
    turnPlainDateToShiftedDateInSystemTimeZone(lastDayOfMonth);

  const lastDayOfLastWeek = turnJSDateToPlainDate(
    endOfWeek(shiftedLastDayOfMonth, {
      weekStartsOn: weekStartsOnDayIndex,
      locale: dateLocale.localeCatalog,
    }),
  );

  const daysOfWeekLabels: string[] = [];

  for (let i = 0; i < 7; i++) {
    const day = addDays(
      turnPlainDateToShiftedDateInSystemTimeZone(firstDayOfFirstWeek),
      i,
    );
    const label = format(day, 'EEE', { locale: dateLocale.localeCatalog });
    daysOfWeekLabels.push(label);
  }

  const weekFirstDays = eachWeekOfInterval(
    {
      start: turnPlainDateToShiftedDateInSystemTimeZone(firstDayOfFirstWeek),
      end: turnPlainDateToShiftedDateInSystemTimeZone(lastDayOfLastWeek),
    },
    {
      weekStartsOn: weekStartsOnDayIndex,
    },
  ).map(turnJSDateToPlainDate);

  return {
    weekStartsOnDayIndex,
    weekDayLabels: daysOfWeekLabels,
    firstDayOfFirstWeek,
    firstDayOfMonth,
    lastDayOfMonth,
    lastDayOfLastWeek,
    weekFirstDays,
  };
};
