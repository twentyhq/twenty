import { isDefined } from 'twenty-shared/utils';

import { isTimeZoneSupported } from '@/localization/utils/isTimeZoneSupported';

// Legacy IANA abbreviation zones that V8 (Chrome/Node) accepts but WebKit's ICU
// rejects with a RangeError. Each maps to a canonical region zone with the same
// current UTC offset and DST rules.
export const LEGACY_TIME_ZONE_TO_IANA: Record<string, string> = {
  CET: 'Europe/Paris',
  MET: 'Europe/Berlin',
  WET: 'Europe/Lisbon',
  EET: 'Europe/Bucharest',
};

// Supported zones pass through unchanged so rendering never changes on engines
// that accept the zone (the region mappings only match the alias rules for
// modern dates, not all historical timestamps). The remap only fires on engines
// that reject the alias (WebKit), where the alternative is a formatting crash.
const toSupportedTimeZone = (timeZone: string): string | undefined => {
  if (isTimeZoneSupported(timeZone)) {
    return timeZone;
  }

  const mappedTimeZone = LEGACY_TIME_ZONE_TO_IANA[timeZone];
  if (isDefined(mappedTimeZone) && isTimeZoneSupported(mappedTimeZone)) {
    return mappedTimeZone;
  }

  return undefined;
};

// Raw engine detection, without the normalization `detectTimeZone` applies on
// top of it (kept here so `detectTimeZone` can depend on this module without an
// import cycle).
const detectRawTimeZone = (): string | undefined => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

// Returns a time zone the current engine can format: the zone itself when
// supported, its canonical equivalent for a rejected legacy alias, then the
// detected zone, then UTC, guaranteeing the result never throws downstream.
export const normalizeTimeZone = (timeZone: string): string => {
  const supportedTimeZone = toSupportedTimeZone(timeZone);
  if (isDefined(supportedTimeZone)) {
    return supportedTimeZone;
  }

  const detectedTimeZone = detectRawTimeZone();
  if (isDefined(detectedTimeZone)) {
    const supportedDetectedTimeZone = toSupportedTimeZone(detectedTimeZone);
    if (isDefined(supportedDetectedTimeZone)) {
      return supportedDetectedTimeZone;
    }
  }

  return 'UTC';
};
