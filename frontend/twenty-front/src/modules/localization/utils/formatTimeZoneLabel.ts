import { formatInTimeZone } from 'date-fns-tz';
import defaultLocale from 'date-fns/locale/en-US';

/**
 * Formats a IANA time zone to a select option label.
 * @param ianaTimeZone IANA time zone
 * @returns Formatted label
 * @example 'Europe/Paris' => '(GMT+01:00) Central European Time - Paris'
 */
export const formatTimeZoneLabel = (ianaTimeZone: string) => {
  const timeZoneWithGmtOffset = formatInTimeZone(
    Date.now(),
    ianaTimeZone,
    `(OOOO) zzzz`,
    { locale: defaultLocale },
  );
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
