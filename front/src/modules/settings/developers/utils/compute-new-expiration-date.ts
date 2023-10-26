import { DateTime } from 'luxon';

export const computeNewExpirationDate = (
  expiresAt: string | null | undefined,
  createdAt: string,
): string | null => {
  if (!expiresAt) {
    return null;
  }
  const days = DateTime.fromISO(expiresAt).diff(DateTime.fromISO(createdAt), [
    'days',
  ]).days;
  return DateTime.utc().plus({ days }).toISO();
};
