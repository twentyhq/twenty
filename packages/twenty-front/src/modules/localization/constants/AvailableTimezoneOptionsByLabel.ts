import { IANA_TIME_ZONES } from 'twenty-shared/constants';
import { AVAILABLE_TIME_ZONE_OPTIONS_REFERENCE_DATE } from '@/localization/constants/AvailableTimezoneOptionsReferenceDate';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { doNotTranslate } from 'twenty-shared/i18n';

const { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } = {
  AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL: IANA_TIME_ZONES.map((ianaTimeZone) => ({
    ianaTimeZone,
    timeZoneLabel: formatTimeZoneLabel({
      timeZone: ianaTimeZone,
      referenceDate: AVAILABLE_TIME_ZONE_OPTIONS_REFERENCE_DATE,
    }),
  })).reduce<Record<string, SelectOption>>(
    (result, { ianaTimeZone, timeZoneLabel }) => {
      if (
        timeZoneLabel.slice(11).includes(doNotTranslate('GMT')) ||
        timeZoneLabel.slice(11).includes(doNotTranslate('UTC')) ||
        timeZoneLabel.slice(11).includes(doNotTranslate('UCT')) ||
        timeZoneLabel in result
      ) {
        return result;
      }

      return {
        ...result,
        [timeZoneLabel]: {
          label: timeZoneLabel,
          value: ianaTimeZone,
        },
      };
    },
    {},
  ),
};

export { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL };
