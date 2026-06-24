import { Temporal } from 'temporal-polyfill';

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
