import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useUserTimezone = () => {
  const currentWorkspaceMember = useAtomValue(currentWorkspaceMemberState);
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
