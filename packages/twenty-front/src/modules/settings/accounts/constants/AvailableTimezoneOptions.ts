import { memoize } from 'lodash';
import { getTimezoneOffset } from 'date-fns-tz';
import { IANA_TIME_ZONES } from '@/localization/constants/IanaTimeZones';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { SelectOption } from '@/ui/input/components/Select';

type TimezoneSelectOption = SelectOption<string> & {
  offset: number; // Add the offset property
};

export const createTimeZoneOptions = memoize(() => {
  const timeZoneOptionsMap = IANA_TIME_ZONES.reduce<Record<string, TimezoneSelectOption>>(
    (result, ianaTimeZone) => {
      const timeZoneLabel = formatTimeZoneLabel(ianaTimeZone);
      const timeZoneName = timeZoneLabel.slice(11);

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
        [timeZoneLabel]: { 
          label: timeZoneLabel, 
          value: ianaTimeZone,
          // Pre-calculate offset to avoid doing it during sorting
          offset: getTimezoneOffset(ianaTimeZone)
        },
      };
    },
    {}
  );

  return Object.values(timeZoneOptionsMap).sort((a, b) => {
    const difference = a.offset - b.offset;
    return difference === 0 ? a.label.localeCompare(b.label) : difference;
  });
  
});

export const AVAILABLE_TIMEZONE_OPTIONS = createTimeZoneOptions();