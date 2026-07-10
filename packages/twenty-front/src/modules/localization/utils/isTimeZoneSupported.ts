import { isDefined } from 'twenty-shared/utils';

// Whether the current JS engine's Intl/ICU knows the given time zone.
// V8 (Chrome/Node) accepts legacy IANA abbreviation zones such as `CET`, while
// WebKit/JavaScriptCore rejects them with a RangeError. Probing here lets us
// fall back before that error reaches a render path and crashes the page.
//
// Support is static for a given engine, and this runs on hot render paths (date
// cells), so results are memoized.
const timeZoneSupportByName = new Map<string, boolean>();

export const isTimeZoneSupported = (timeZone: string): boolean => {
  const cachedResult = timeZoneSupportByName.get(timeZone);
  if (isDefined(cachedResult)) {
    return cachedResult;
  }

  let isSupported: boolean;
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    isSupported = true;
  } catch {
    isSupported = false;
  }

  timeZoneSupportByName.set(timeZone, isSupported);

  return isSupported;
};
