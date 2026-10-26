import { IANA_TIME_ZONES } from 'twenty-shared/constants';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { doNotTranslate } from 'twenty-shared/i18n';

const { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } = {
  AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL: IANA_TIME_ZONES.reduce<
    Record<string, SelectOption>
  >((result, ianaTimeZone) => {
    if (
      formatTimeZoneLabel({ timeZone: ianaTimeZone })
        .slice(11)
        .includes(doNotTranslate('GMT')) ||
      formatTimeZoneLabel({ timeZone: ianaTimeZone })
        .slice(11)
        .includes(doNotTranslate('UTC')) ||
      formatTimeZoneLabel({ timeZone: ianaTimeZone })
        .slice(11)
        .includes(doNotTranslate('UCT')) ||
      formatTimeZoneLabel({ timeZone: ianaTimeZone }) in result
    ) {
      return result;
    }

    return {
      ...result,
      [formatTimeZoneLabel({ timeZone: ianaTimeZone })]: {
        label: formatTimeZoneLabel({ timeZone: ianaTimeZone }),
        value: ianaTimeZone,
      },
    };
  }, {}),
};

export { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL };
