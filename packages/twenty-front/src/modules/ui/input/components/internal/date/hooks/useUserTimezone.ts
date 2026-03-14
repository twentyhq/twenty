import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isValidTimeZone } from '@/localization/utils/isValidTimeZone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useUserTimezone = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const memberTimeZone = currentWorkspaceMember?.timeZone;

  const userTimezone =
    memberTimeZone !== 'system' &&
    memberTimeZone !== undefined &&
    memberTimeZone !== null &&
    isValidTimeZone(memberTimeZone)
      ? memberTimeZone
      : systemTimeZone;

  const isSystemTimezone = userTimezone === systemTimeZone;

  return {
    userTimezone,
    isSystemTimezone,
    systemTimeZone,
  };
};
