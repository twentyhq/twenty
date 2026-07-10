import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { normalizeTimeZone } from '@/localization/utils/normalizeTimeZone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useUserTimezone = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const systemTimeZone = normalizeTimeZone(detectTimeZone());

  const rawUserTimezone =
    currentWorkspaceMember?.timeZone !== 'system'
      ? (currentWorkspaceMember?.timeZone ?? systemTimeZone)
      : systemTimeZone;

  // A stored preference can be a legacy alias (e.g. `CET`) that WebKit's ICU
  // rejects; normalizing here keeps every consumer (Temporal, date-fns-tz,
  // raw Intl) from throwing and crashing the render.
  const userTimezone = normalizeTimeZone(rawUserTimezone);

  const isSystemTimezone = userTimezone === systemTimeZone;

  return {
    userTimezone,
    isSystemTimezone,
    systemTimeZone,
  };
};
