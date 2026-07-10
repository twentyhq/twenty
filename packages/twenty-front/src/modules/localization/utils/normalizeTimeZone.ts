import { isDefined } from 'twenty-shared/utils';

import { isTimeZoneSupported } from '@/localization/utils/isTimeZoneSupported';

// Legacy IANA abbreviation zones that V8 (Chrome/Node) accepts but WebKit's ICU
// rejects with a RangeError. Each maps to a canonical region zone with the same
// UTC offset and DST rules, so a stored preference like `CET` keeps working on
// Safari instead of crashing the render tree, and renders identically on V8.
export const LEGACY_TIME_ZONE_TO_IANA: Record<string, string> = {
  CET: 'Europe/Paris',
  MET: 'Europe/Berlin',
  WET: 'Europe/Lisbon',
  EET: 'Europe/Bucharest',
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

// Returns a time zone the current engine can format. Legacy aliases are mapped
// to their canonical region zone on every engine (same rendering, valid on the
// server); other supported zones pass through unchanged; anything the engine
// rejects falls back to the detected zone, then UTC, guaranteeing the result
// never throws downstream.
export const normalizeTimeZone = (timeZone: string): string => {
  const canonicalTimeZone = LEGACY_TIME_ZONE_TO_IANA[timeZone] ?? timeZone;
  if (isTimeZoneSupported(canonicalTimeZone)) {
    return canonicalTimeZone;
  }

  const detectedTimeZone = detectRawTimeZone();
  if (isDefined(detectedTimeZone)) {
    const canonicalDetectedTimeZone =
      LEGACY_TIME_ZONE_TO_IANA[detectedTimeZone] ?? detectedTimeZone;
    if (isTimeZoneSupported(canonicalDetectedTimeZone)) {
      return canonicalDetectedTimeZone;
    }
  }

  return 'UTC';
};
