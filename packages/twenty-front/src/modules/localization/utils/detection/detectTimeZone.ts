/**
 * Detects the user's time zone.
 * @returns a IANA time zone
 */
export const detectTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};
