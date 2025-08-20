import { IANA_TIME_ZONES } from '@/localization/constants/IanaTimeZones';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { type SelectOption } from 'twenty-ui/input';

const { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } = {
  AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL: IANA_TIME_ZONES.reduce<
    Record<string, SelectOption>
  >((result, ianaTimeZone) => {
    // Skip time zones with GMT, UTC, or UCT in their name,
    // and duplicates.
    if (
      formatTimeZoneLabel(ianaTimeZone).slice(11).includes('GMT') ||
      formatTimeZoneLabel(ianaTimeZone).slice(11).includes('UTC') ||
      formatTimeZoneLabel(ianaTimeZone).slice(11).includes('UCT') ||
      formatTimeZoneLabel(ianaTimeZone) in result
    ) {
      return result;
    }

    return {
      ...result,
      [formatTimeZoneLabel(ianaTimeZone)]: {
        label: formatTimeZoneLabel(ianaTimeZone),
        value: ianaTimeZone,
      },
    };
  }, {}),
};

export { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL };
