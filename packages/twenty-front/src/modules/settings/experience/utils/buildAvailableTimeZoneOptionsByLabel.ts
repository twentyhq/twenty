import { IANA_TIME_ZONES } from 'twenty-shared/constants';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { normalizeTimeZone } from '@/localization/utils/normalizeTimeZone';
import { type SelectOption } from 'twenty-ui/input';

export const buildAvailableTimeZoneOptionsByLabel = (): Record<
  string,
  SelectOption
> =>
  IANA_TIME_ZONES.reduce<Record<string, SelectOption>>(
    (result, ianaTimeZone) => {
      // Skip zones that don't survive normalization: legacy aliases (CET, MET,
      // WET, EET) crash WebKit's ICU and duplicate their canonical region zone,
      // and zones unknown to the running engine can't be formatted at all.
      // Offering only pass-through zones keeps persisted preferences safe on
      // every engine. This runs at module init, so any throw here would blank
      // the whole app on engines rejecting one of the listed zones.
      if (normalizeTimeZone(ianaTimeZone) !== ianaTimeZone) {
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
