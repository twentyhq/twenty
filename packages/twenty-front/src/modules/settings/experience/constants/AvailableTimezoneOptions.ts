import { getTimezoneOffset } from 'date-fns-tz';

import { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } from '@/settings/experience/constants/AvailableTimezoneOptionsByLabel';

export const AVAILABLE_TIMEZONE_OPTIONS = Object.values(
  AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL,
).sort((optionA, optionB) => {
  const difference =
    getTimezoneOffset(optionA.value) - getTimezoneOffset(optionB.value);

  return difference === 0
    ? // Sort alphabetically if the time zone offsets are the same.
      optionA.label.localeCompare(optionB.label)
    : // Sort by time zone offset if different.
      difference;
});
