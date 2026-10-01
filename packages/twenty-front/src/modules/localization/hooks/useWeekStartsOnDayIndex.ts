import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { getCalendarStartDayFromWorkspaceMember } from '@/localization/utils/format-preferences/getCalendarStartDayFromWorkspaceMember';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CalendarStartDay } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const useWeekStartsOnDayIndex = (): number => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  return isDefined(currentWorkspaceMember)
    ? getCalendarStartDayFromWorkspaceMember(currentWorkspaceMember)
    : CalendarStartDay[detectCalendarStartDay()];
};
