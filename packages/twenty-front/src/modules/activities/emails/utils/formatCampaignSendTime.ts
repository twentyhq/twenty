import { isNonEmptyString } from '@sniptt/guards';
import { type Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { TimeFormat } from '@/localization/constants/TimeFormat';

const TIME_ZONE_ABBREVIATION_FORMAT = 'zzz';

export const formatCampaignSendTime = ({
  value,
  timeZone,
  timeFormat,
  localeCatalog,
}: {
  value?: string | null;
  timeZone: string;
  timeFormat: TimeFormat;
  localeCatalog: Locale;
}): string => {
  if (!isNonEmptyString(value)) {
    return '';
  }

  const sendDate = new Date(value);

  if (Number.isNaN(sendDate.getTime())) {
    return '';
  }

  const sendTime = new Intl.DateTimeFormat(localeCatalog.code, {
    dateStyle: 'full',
    timeStyle: 'short',
    hourCycle: timeFormat === TimeFormat.HOUR_24 ? 'h23' : 'h12',
    timeZone,
  }).format(sendDate);

  const timeZoneAbbreviation = formatInTimeZone(
    sendDate,
    timeZone,
    TIME_ZONE_ABBREVIATION_FORMAT,
    { locale: localeCatalog },
  );

  return `${sendTime} ${timeZoneAbbreviation}`;
};
