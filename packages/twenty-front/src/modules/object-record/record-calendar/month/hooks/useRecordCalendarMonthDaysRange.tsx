import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from 'twenty-shared';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import {
  addDays,
  eachWeekOfInterval,
  endOfWeek,
  format,
  lastDayOfMonth as lastDayOfMonthFn,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useRecoilValue } from 'recoil';

import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useRecordCalendarMonthDaysRange = (selectedDate: Date) => {
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

  const firstDayOfMonth = startOfMonth(selectedDate);
  const lastDayOfMonth = lastDayOfMonthFn(selectedDate);

  const firstDayOfFirstWeek = startOfWeek(firstDayOfMonth, {
    weekStartsOn: weekStartsOnDayIndex,
    locale: dateLocale.localeCatalog,
  });

  const lastDayOfLastWeek = endOfWeek(lastDayOfMonth, {
    weekStartsOn: weekStartsOnDayIndex,
    locale: dateLocale.localeCatalog,
  });

  const daysOfWeekLabels: string[] = [];

  for (let i = 0; i < 7; i++) {
    const day = addDays(firstDayOfFirstWeek, i);
    const label = format(day, 'EEE', { locale: dateLocale.localeCatalog });
    daysOfWeekLabels.push(label);
  }

  const weekFirstDays = eachWeekOfInterval(
    {
      start: firstDayOfFirstWeek,
      end: lastDayOfLastWeek,
    },
    {
      weekStartsOn: weekStartsOnDayIndex,
    },
  );

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
