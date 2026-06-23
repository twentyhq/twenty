import { Temporal } from 'temporal-polyfill';

// Leniently convert a stored date-time value to a Temporal.Instant.
// A DATE_TIME field can hold legacy date-only values (e.g. "2026-05-07") coming
// from imports or API writes. Temporal.Instant.from is strict and throws on
// those, so fall back to interpreting a date-only value as start-of-day UTC and
// return null when the value cannot be parsed at all, letting callers degrade
// instead of crashing.
export const parseStringToInstantOrNull = (
  value: string,
): Temporal.Instant | null => {
  try {
    return Temporal.Instant.from(value);
  } catch {
    try {
      return Temporal.PlainDate.from(value).toZonedDateTime('UTC').toInstant();
    } catch {
      return null;
    }
  }
};
