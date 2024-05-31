/**
 * Detects the user's time zone.
 * @returns a IANA time zone
 */
export const detectTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;
