import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

export const useLogConsoleTimeZone = () => {
  const { timeZone } = useDateTimeFormat();

  return timeZone;
};
