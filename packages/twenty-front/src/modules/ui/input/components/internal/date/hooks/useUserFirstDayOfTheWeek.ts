import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { useRecoilValue } from 'recoil';
import { CalendarStartDay } from 'twenty-shared/constants';
import {
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
} from 'twenty-shared/utils';

export const useUserFirstDayOfTheWeek = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const systemFirstDayOfTheWeek = detectCalendarStartDay();

  const isSystemFirstDayOfTheWeek =
    currentWorkspaceMember?.calendarStartDay === CalendarStartDay.SYSTEM;

  const currentWorkspaceMemberCalendarStartDayNonIsoNumber =
    currentWorkspaceMember?.calendarStartDay;

  const currentWorkspaceMemberFirstDayOfTheWeek = isDefined(
    currentWorkspaceMemberCalendarStartDayNonIsoNumber,
  )
    ? convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        currentWorkspaceMemberCalendarStartDayNonIsoNumber,
        systemFirstDayOfTheWeek,
      )
    : undefined;

  const userFirstDayOfTheWeek = isSystemFirstDayOfTheWeek
    ? systemFirstDayOfTheWeek
    : (currentWorkspaceMemberFirstDayOfTheWeek ?? systemFirstDayOfTheWeek);

  return {
    isSystemFirstDayOfTheWeek,
    systemFirstDayOfTheWeek,
    userFirstDayOfTheWeek,
  };
};
