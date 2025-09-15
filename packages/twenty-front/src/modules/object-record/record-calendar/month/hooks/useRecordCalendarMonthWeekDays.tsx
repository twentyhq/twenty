import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from '@/localization/constants/CalendarStartDay';
import { detectCalendarStartDay } from '@/localization/utils/detectCalendarStartDay';
import { addDays, format, startOfWeek } from 'date-fns';
import { useRecoilValue } from 'recoil';

import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useRecordCalendarMonthWeekDays = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const dateLocale = useRecoilValue(dateLocaleState);

  if (!currentWorkspaceMember) {
    return {
      labels: [],
    };
  }

  const startDayIndex =
    currentWorkspaceMember?.calendarStartDay === CalendarStartDay.SYSTEM
      ? CalendarStartDay[detectCalendarStartDay()]
      : (currentWorkspaceMember?.calendarStartDay ?? 0);

  const daysOfWeekLabels: string[] = [];
  const referenceDate = new Date(2024, 0, 1);

  // TODO refactor this logic to extract this to an util and hooks (also need to be done on InternalDatePicker)
  const weekStart = startOfWeek(referenceDate, {
    weekStartsOn: startDayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    locale: dateLocale.localeCatalog,
  });

  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const label = format(day, 'EEE', { locale: dateLocale.localeCatalog });
    daysOfWeekLabels.push(label);
  }

  return {
    labels: daysOfWeekLabels,
  };
};
