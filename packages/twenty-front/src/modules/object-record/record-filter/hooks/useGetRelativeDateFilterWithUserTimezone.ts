import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CalendarStartDay } from 'twenty-shared/constants';
import { type FirstDayOfTheWeek } from 'twenty-shared/types';
import { type RelativeDateFilter } from 'twenty-shared/utils';

export const useGetRelativeDateFilterWithUserTimezone = () => {
  const { userTimezone } = useUserTimezone();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { calendarSystem } = useDateTimeFormat();

  const getRelativeDateFilterWithUserTimezone = (
    relativeDateFilter: RelativeDateFilter,
  ): RelativeDateFilter => {
    const userDefinedCalendarStartDay =
      CalendarStartDay[
        currentWorkspaceMember?.calendarStartDay ?? CalendarStartDay.SYSTEM
      ];
    const defaultSystemCalendarStartDay = detectCalendarStartDay();

    const resolvedCalendarStartDay = (
      userDefinedCalendarStartDay === CalendarStartDay[CalendarStartDay.SYSTEM]
        ? defaultSystemCalendarStartDay
        : userDefinedCalendarStartDay
    ) as FirstDayOfTheWeek;

    return {
      ...relativeDateFilter,
      timezone: userTimezone,
      firstDayOfTheWeek: resolvedCalendarStartDay,
      calendarSystem:
        calendarSystem === CalendarSystem.GREGORIAN
          ? undefined
          : calendarSystem,
    };
  };

  return {
    getRelativeDateFilterWithUserTimezone,
  };
};
