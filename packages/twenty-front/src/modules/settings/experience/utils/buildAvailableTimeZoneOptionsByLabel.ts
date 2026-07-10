import { IANA_TIME_ZONES } from 'twenty-shared/constants';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { isTimeZoneSupported } from '@/localization/utils/isTimeZoneSupported';
import { LEGACY_TIME_ZONE_TO_IANA } from '@/localization/utils/normalizeTimeZone';
import { type SelectOption } from 'twenty-ui/input';

export const buildAvailableTimeZoneOptionsByLabel = (): Record<
  string,
  SelectOption
> =>
  IANA_TIME_ZONES.reduce<Record<string, SelectOption>>(
    (result, ianaTimeZone) => {
      // Skip legacy aliases (CET, MET, WET, EET) on every engine: picking one
      // persists a zone that crashes WebKit's ICU, and their canonical region
      // zones are already in the list. Also skip zones the running engine
      // can't format. This runs at module init, so any throw here would blank
      // the whole app on engines rejecting one of the listed zones.
      if (
        ianaTimeZone in LEGACY_TIME_ZONE_TO_IANA ||
        !isTimeZoneSupported(ianaTimeZone)
      ) {
        return result;
      }

      const timeZoneLabel = formatTimeZoneLabel(ianaTimeZone);

      // Skip time zones with GMT, UTC, or UCT in their name,
      // and duplicates.
      if (
        timeZoneLabel.slice(11).includes('GMT') ||
        timeZoneLabel.slice(11).includes('UTC') ||
        timeZoneLabel.slice(11).includes('UCT') ||
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
  );
