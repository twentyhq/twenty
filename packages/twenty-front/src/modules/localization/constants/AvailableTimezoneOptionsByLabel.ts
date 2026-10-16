import { IANA_TIME_ZONES } from 'twenty-shared/constants';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { type SelectOption } from 'twenty-ui/primitives/input';

const { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } = {
  AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL: IANA_TIME_ZONES.reduce<
    Record<string, SelectOption>
  >((result, ianaTimeZone) => {
    if (
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a date format or time-zone identifier.
      formatTimeZoneLabel(ianaTimeZone).slice(11).includes('GMT') ||
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a date format or time-zone identifier.
      formatTimeZoneLabel(ianaTimeZone).slice(11).includes('UTC') ||
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a date format or time-zone identifier.
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
