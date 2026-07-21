import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { format } from 'date-fns';
import { type Temporal } from 'temporal-polyfill';
import { CalendarStartDay } from 'twenty-shared/constants';
import { turnPlainDateToShiftedDateInSystemTimeZone } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useRecordCalendarWeekDaysRange = (
  selectedDate: Temporal.PlainDate,
) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const dateLocale = useAtomStateValue(dateLocaleState);

  const calendarStartDay =
    currentWorkspaceMember?.calendarStartDay ?? CalendarStartDay.SYSTEM;

  const weekStartsOnDayIndex = (
    calendarStartDay === CalendarStartDay.SYSTEM
      ? CalendarStartDay[detectCalendarStartDay()]
      : calendarStartDay
  ) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  const selectedDayIndex = selectedDate.dayOfWeek % 7;
  const daysSinceStartOfWeek =
    (selectedDayIndex - weekStartsOnDayIndex + 7) % 7;
  const firstDayOfWeek = selectedDate.subtract({
    days: daysSinceStartOfWeek,
  });

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = firstDayOfWeek.add({ days: index });

    return {
      date,
      label: format(turnPlainDateToShiftedDateInSystemTimeZone(date), 'EEE', {
        locale: dateLocale.localeCatalog,
      }),
    };
  });

  return {
    firstDayOfWeek,
    lastDayOfWeek: firstDayOfWeek.add({ days: 6 }),
    weekDays,
  };
};
