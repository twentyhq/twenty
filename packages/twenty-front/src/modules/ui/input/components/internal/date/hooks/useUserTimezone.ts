import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useUserTimezone = () => {
  const currentWorkspaceMember = useRecoilValueV2(currentWorkspaceMemberState);
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const userTimezone =
    currentWorkspaceMember?.timeZone !== 'system'
      ? (currentWorkspaceMember?.timeZone ?? systemTimeZone)
      : systemTimeZone;

  const isSystemTimezone = userTimezone === systemTimeZone;

  return {
    userTimezone,
    isSystemTimezone,
    systemTimeZone,
  };
};
