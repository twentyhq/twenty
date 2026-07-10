import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { normalizeTimeZone } from '@/localization/utils/normalizeTimeZone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useUserTimezone = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const systemTimeZone = detectTimeZone();

  // Normalized because the stored value can be a legacy alias (e.g. `CET`)
  // that WebKit's Intl/Temporal rejects.
  const userTimezone =
    currentWorkspaceMember?.timeZone !== 'system'
      ? normalizeTimeZone(currentWorkspaceMember?.timeZone ?? systemTimeZone)
      : systemTimeZone;

  const isSystemTimezone = userTimezone === systemTimeZone;

  return {
    userTimezone,
    isSystemTimezone,
    systemTimeZone,
  };
};
