import { isNonEmptyString } from '@sniptt/guards';
import { type Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { type DateFormat } from '@/localization/constants/DateFormat';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

const TIME_ZONE_ABBREVIATION_FORMAT = 'zzz';

export const formatCampaignSendTime = ({
  value,
  timeZone,
  dateFormat,
  timeFormat,
  localeCatalog,
}: {
  value?: string | null;
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  localeCatalog: Locale;
}): string => {
  const sendTime = formatDateTimeString({
    value,
    timeZone,
    dateFormat,
    timeFormat,
    localeCatalog,
  });

  if (!isNonEmptyString(sendTime) || !isNonEmptyString(value)) {
    return '';
  }

  const timeZoneAbbreviation = formatInTimeZone(
    new Date(value),
    timeZone,
    TIME_ZONE_ABBREVIATION_FORMAT,
    { locale: localeCatalog },
  );

  return `${sendTime} ${timeZoneAbbreviation}`;
};
