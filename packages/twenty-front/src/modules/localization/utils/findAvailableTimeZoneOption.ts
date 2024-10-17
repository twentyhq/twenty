import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } from '@/settings/accounts/constants/AvailableTimezoneOptionsByLabel';

/**
 * Finds the matching available IANA time zone select option from a given IANA time zone.
 * Performs case-insensitive matching on the formatted time zone label.
 * @param value the IANA time zone to match
 * @returns the matching available IANA time zone select option or undefined
 */
export const findAvailableTimeZoneOption = (value: string): string | undefined => {
  if (!value || typeof value !== 'string') {
    return undefined; // Return undefined if the input is not valid
  }

  const formattedLabel = formatTimeZoneLabel(value).toLowerCase();

  const availableTimeZones = Object.keys(AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL).reduce(
    (acc, key) => ({
      ...acc,
      [key.toLowerCase()]: AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL[key],
    }),
    {}
  );
  return availableTimeZones[formattedLabel];
};

