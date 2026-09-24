import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

export const useSettingsLogsTimeZone = () => {
  const { timeZone } = useDateTimeFormat();

  return timeZone;
};
