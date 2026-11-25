import { t } from '@lingui/core/macro';
import { type Locale } from 'date-fns';
import { Temporal } from 'temporal-polyfill';

import { getChatMessageDayKey } from '@/chat/utils/getChatMessageDayKey';
import { type DateFormat } from '@/localization/constants/DateFormat';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';

export const getChatMessageDayLabel = ({
  date,
  timeZone,
  dateFormat,
  localeCatalog,
}: {
  date: Date | string;
  timeZone: string;
  dateFormat: DateFormat;
  localeCatalog?: Locale;
}): string => {
  const today = Temporal.Now.plainDateISO(timeZone);
  const dayKey = getChatMessageDayKey({ createdAt: date, timeZone });

  if (dayKey === today.toString()) {
    return t`Today`;
  }

  if (dayKey === today.subtract({ days: 1 }).toString()) {
    return t`Yesterday`;
  }

  return formatDateISOStringToDate({
    date: new Date(date).toISOString(),
    timeZone,
    dateFormat,
    localeCatalog,
  });
};
