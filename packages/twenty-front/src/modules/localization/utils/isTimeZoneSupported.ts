// Whether the current JS engine's Intl/ICU knows the given time zone.
// V8 (Chrome/Node) accepts legacy IANA abbreviation zones such as `CET`, while
// WebKit/JavaScriptCore rejects them with a RangeError. Probing here lets us
// fall back before that error reaches a render path and crashes the page.
export const isTimeZoneSupported = (timeZone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });

    return true;
  } catch {
    return false;
  }
};
