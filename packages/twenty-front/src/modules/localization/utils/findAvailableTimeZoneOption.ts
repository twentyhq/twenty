import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } from '@/settings/accounts/constants/AvailableTimezoneOptionsByLabel';

/**
 * Finds the matching available IANA time zone select option from a given IANA time zone.
 * If no match is found, it falls back to the user's browser time zone.
 * @param value the IANA time zone to match
 * @returns the matching available IANA time zone select option
 */
export const findAvailableTimeZoneOption = (value: string) => {
  const formattedLabel = formatTimeZoneLabel(value);
  
  
  if (AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL[formattedLabel]) {
    return AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL[formattedLabel];
  }

  const labelWithoutGMT = formattedLabel.replace(/^\(GMT[+-]\d{2}:\d{2}\)\s/, '');
  const matchingKey = Object.keys(AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL).find(key => 
    key.includes(labelWithoutGMT) || labelWithoutGMT.includes(key.replace(/^\(GMT[+-]\d{2}:\d{2}\)\s/, ''))
  );

  if (matchingKey) {
    return AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL[matchingKey];
  }

  
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const browserFormattedLabel = formatTimeZoneLabel(browserTimeZone);
  
  if (AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL[browserFormattedLabel]) {
    console.warn(`No match found for ${value}. Falling back to browser time zone: ${browserTimeZone}`);
    return AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL[browserFormattedLabel];
  }

  const fallbackOption = Object.values(AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL)[0];
  console.warn(`No match found for ${value} and browser time zone not available. Using fallback: ${fallbackOption.value}`);
  return fallbackOption;
}
