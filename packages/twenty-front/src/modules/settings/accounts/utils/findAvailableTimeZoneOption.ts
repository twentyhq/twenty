import { availableTimeZoneOptionsByLabel } from '@/settings/accounts/constants/timeZoneSelectOptions';
import { formatTimeZoneLabel } from '@/settings/accounts/utils/formatTimeZoneLabel';

/**
 * Finds the matching available IANA time zone select option from a given IANA time zone.
 * @param value the IANA time zone to match
 * @returns the matching available IANA time zone select option or undefined
 */
export const findAvailableTimeZoneOption = (value: string) =>
  availableTimeZoneOptionsByLabel[formatTimeZoneLabel(value)];
