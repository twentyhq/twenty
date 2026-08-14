import { formatInTimeZone } from 'date-fns-tz';
import { enUS as defaultLocale } from 'date-fns/locale/en-US';

// 'Europe/Paris' => '(GMT+01:00) Central European Time - Paris'
export const formatTimeZoneLabel = (ianaTimeZone: string) => {
  let timeZoneWithGmtOffset: string;

  try {
    timeZoneWithGmtOffset = formatInTimeZone(
      Date.now(),
      ianaTimeZone,
      `(OOOO) zzzz`,
      { locale: defaultLocale },
    );
  } catch {
    return ianaTimeZone;
  }
  const ianaTimeZoneParts = ianaTimeZone.split('/');
  const location =
    ianaTimeZoneParts.length > 1
      ? ianaTimeZoneParts.slice(-1)[0].replaceAll('_', ' ')
      : undefined;

  const timeZoneLabel =
    !location || timeZoneWithGmtOffset.includes(location)
      ? timeZoneWithGmtOffset
      : [timeZoneWithGmtOffset, location].join(' - ');

  return timeZoneLabel;
};
