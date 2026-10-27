import { formatInTimeZone } from 'date-fns-tz';
import { enUS as defaultLocale } from 'date-fns/locale/en-US';
import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';

// 'Europe/Paris' => '(GMT+01:00) Central European Time - Paris'
export const formatTimeZoneLabel = ({
  timeZone,
  referenceDate = new Date(),
}: {
  timeZone: string;
  referenceDate?: Date;
}) => {
  let timeZoneWithGmtOffset: string;

  try {
    timeZoneWithGmtOffset = formatInTimeZone(
      referenceDate,
      timeZone,
      doNotTranslate(`(OOOO) zzzz`),
      { locale: defaultLocale },
    );
  } catch {
    return timeZone;
  }
  const ianaTimeZoneParts = timeZone.split('/');
  const location =
    ianaTimeZoneParts.length > 1
      ? ianaTimeZoneParts.slice(-1)[0].replaceAll('_', ' ')
      : undefined;

  const timeZoneLabel =
    !isNonEmptyString(location) || timeZoneWithGmtOffset.includes(location)
      ? timeZoneWithGmtOffset
      : [timeZoneWithGmtOffset, location].join(' - ');

  return timeZoneLabel;
};
