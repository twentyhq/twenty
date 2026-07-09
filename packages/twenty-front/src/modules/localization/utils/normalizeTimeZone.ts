import { isDefined } from 'twenty-shared/utils';

import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { isTimeZoneSupported } from '@/localization/utils/isTimeZoneSupported';

// Legacy IANA abbreviation zones that V8 (Chrome/Node) accepts but WebKit's ICU
// rejects. Each maps to a canonical region zone with equivalent DST behavior so
// a stored preference like `CET` keeps working on Safari instead of throwing a
// RangeError inside formatInTimeZone and crashing the render tree.
const LEGACY_TIME_ZONE_TO_IANA: Record<string, string> = {
  CET: 'Europe/Paris',
  MET: 'Europe/Berlin',
  WET: 'Europe/Lisbon',
  EET: 'Europe/Bucharest',
};

// Returns a time zone the current engine can format. Supported zones pass
// through unchanged (no behavior change on engines that already accept them);
// otherwise we remap a known legacy alias, then fall back to the detected zone,
// then UTC, guaranteeing the result never throws downstream.
export const normalizeTimeZone = (timeZone: string): string => {
  if (isTimeZoneSupported(timeZone)) {
    return timeZone;
  }

  const mappedTimeZone = LEGACY_TIME_ZONE_TO_IANA[timeZone];
  if (isDefined(mappedTimeZone) && isTimeZoneSupported(mappedTimeZone)) {
    return mappedTimeZone;
  }

  const detectedTimeZone = detectTimeZone();

  return isTimeZoneSupported(detectedTimeZone) ? detectedTimeZone : 'UTC';
};
