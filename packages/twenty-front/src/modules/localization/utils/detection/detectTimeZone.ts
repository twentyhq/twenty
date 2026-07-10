import { normalizeTimeZone } from '@/localization/utils/normalizeTimeZone';

/**
 * Detects the user's time zone.
 * @returns a IANA time zone the current engine can format. Detection can yield
 * legacy alias zones (e.g. WebKit resolving `CET`) that the same engine then
 * rejects when passed back to Intl or date-fns-tz, so the raw value is
 * normalized before being handed to any formatting path.
 */
export const detectTimeZone = (): string => {
  try {
    return normalizeTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return 'UTC';
  }
};
