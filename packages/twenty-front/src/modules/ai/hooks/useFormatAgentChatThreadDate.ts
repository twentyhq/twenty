import { useLingui } from '@lingui/react/macro';
import { formatInTimeZone } from 'date-fns-tz';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { dateLocaleState } from '@/localization/states/dateLocaleState';

// Today reads as its time alone, other days in the member's date format
export const useFormatAgentChatThreadDate = () => {
  const { t } = useLingui();
  const { timeZone, dateFormat, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const isTodayInTimeZone = (date: Date) =>
    formatInTimeZone(date, timeZone, 'yyyy-MM-dd') ===
    formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');

  const formatTime = (date: Date) =>
    formatInTimeZone(date, timeZone, timeFormat, { locale: localeCatalog });

  const formatAgentChatThreadDay = (date: Date) =>
    isTodayInTimeZone(date)
      ? formatTime(date)
      : formatDateISOStringToDate({
          date: date.toISOString(),
          timeZone,
          dateFormat,
          localeCatalog,
        });

  const formatAgentChatThreadDateTime = (date: Date) => {
    if (isTodayInTimeZone(date)) {
      const time = formatTime(date);

      return t`Today, ${time}`;
    }

    return formatDateISOStringToDateTime({
      date: date.toISOString(),
      timeZone,
      dateFormat,
      timeFormat,
      localeCatalog,
    });
  };

  return { formatAgentChatThreadDay, formatAgentChatThreadDateTime };
};
