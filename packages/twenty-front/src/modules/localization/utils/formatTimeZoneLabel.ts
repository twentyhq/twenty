import { formatInTimeZone } from 'date-fns-tz';
import { enUS as defaultLocale } from 'date-fns/locale/en-US';

import { normalizeTimeZone } from '@/localization/utils/normalizeTimeZone';

/**
 * Formats a IANA time zone to a select option label.
 * @param ianaTimeZone IANA time zone
 * @returns Formatted label
 * @example 'Europe/Paris' => '(GMT+01:00) Central European Time - Paris'
 */
export const formatTimeZoneLabel = (ianaTimeZone: string) => {
  // Normalized so a legacy alias (e.g. a stored `CET` preference) resolves to
  // the label of its canonical zone instead of throwing on engines whose ICU
  // rejects the alias (WebKit).
  const supportedTimeZone = normalizeTimeZone(ianaTimeZone);
  const timeZoneWithGmtOffset = formatInTimeZone(
    Date.now(),
    supportedTimeZone,
    `(OOOO) zzzz`,
    { locale: defaultLocale },
  );
  const ianaTimeZoneParts = supportedTimeZone.split('/');
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
