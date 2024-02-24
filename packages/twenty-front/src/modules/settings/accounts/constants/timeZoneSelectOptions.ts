import { getTimezoneOffset } from 'date-fns-tz';

import { ianaTimeZones } from '@/settings/accounts/constants/ianaTimeZones';
import { formatTimeZoneLabel } from '@/settings/accounts/utils/formatTimeZoneLabel';
import { SelectOption } from '@/ui/input/components/Select';

export const availableTimeZoneOptionsByLabel = ianaTimeZones.reduce<
  Record<string, SelectOption<string>>
>((result, ianaTimeZone) => {
  const timeZoneLabel = formatTimeZoneLabel(ianaTimeZone);

  // Remove the '(GMT±00:00) ' prefix from the label.
  const timeZoneName = timeZoneLabel.slice(11);

  // Skip time zones with GMT, UTC, or UCT in their name,
  // and duplicates.
  if (
    timeZoneName.includes('GMT') ||
    timeZoneName.includes('UTC') ||
    timeZoneName.includes('UCT') ||
    timeZoneLabel in result
  ) {
    return result;
  }

  return {
    ...result,
    [timeZoneLabel]: { label: timeZoneLabel, value: ianaTimeZone },
  };
}, {});

export const availableTimeZoneOptions = Object.values(
  availableTimeZoneOptionsByLabel,
).sort((optionA, optionB) => {
  const difference =
    getTimezoneOffset(optionA.value) - getTimezoneOffset(optionB.value);

  return difference === 0
    ? // Sort alphabetically if the time zone offsets are the same.
      optionA.label.localeCompare(optionB.label)
    : // Sort by time zone offset if different.
      difference;
});
