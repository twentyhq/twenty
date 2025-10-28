import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { tzName } from '@date-fns/tz';
import { useRecoilValue } from 'recoil';

export const useUserTimezone = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const userTimezone =
    currentWorkspaceMember?.timeZone !== 'system'
      ? (currentWorkspaceMember?.timeZone ?? systemTimeZone)
      : systemTimeZone;

  const isSystemTimezone = userTimezone === systemTimeZone;

  const getTimezoneAbbreviationForPointInTime = (date: Date) => {
    return tzName(userTimezone, date, 'short');
  };

  return {
    userTimezone,
    isSystemTimezone,
    getTimezoneAbbreviationForPointInTime,
  };
};
