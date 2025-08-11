import { getTimezoneOffset } from 'date-fns-tz';

import { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } from '@/settings/experience/constants/AvailableTimezoneOptionsByLabel';

const { AVAILABLE_TIMEZONE_OPTIONS } = {
  AVAILABLE_TIMEZONE_OPTIONS: Object.values(
    AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL,
  ).sort((optionA, optionB) => {
    return getTimezoneOffset(optionA.value) -
      getTimezoneOffset(optionB.value) ===
      0
      ? // Sort alphabetically if the time zone offsets are the same.
        optionA.label.localeCompare(optionB.label)
      : // Sort by time zone offset if different.
        getTimezoneOffset(optionA.value) - getTimezoneOffset(optionB.value);
  }),
};

export { AVAILABLE_TIMEZONE_OPTIONS };
