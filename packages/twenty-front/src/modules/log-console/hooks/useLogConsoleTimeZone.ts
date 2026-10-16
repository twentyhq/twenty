import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { logConsoleTimeZoneState } from '@/log-console/states/logConsoleTimeZoneState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useLogConsoleTimeZone = () => {
  const { timeZone } = useDateTimeFormat();
  const logConsoleTimeZone = useAtomStateValue(logConsoleTimeZoneState);

  // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a date format or time-zone identifier.
  return logConsoleTimeZone === 'utc' ? 'UTC' : timeZone;
};
