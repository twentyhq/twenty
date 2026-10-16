import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { logConsoleTimeZoneState } from '@/log-console/states/logConsoleTimeZoneState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useLogConsoleTimeZone = () => {
  const { timeZone } = useDateTimeFormat();
  const logConsoleTimeZone = useAtomStateValue(logConsoleTimeZoneState);

  return logConsoleTimeZone === 'utc' ? doNotTranslate('UTC') : timeZone;
};
