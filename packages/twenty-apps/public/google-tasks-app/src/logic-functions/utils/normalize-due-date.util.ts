import { isNonEmptyString, isNull } from '@sniptt/guards';

const DUE_TIME_OF_DAY_UTC = 'T12:00:00.000Z';
const GOOGLE_DUE_TIME_OF_DAY_UTC = 'T00:00:00.000Z';

export const toComparableDueDate = (
  date: string | null | undefined,
): string | null => {
  if (!isNonEmptyString(date)) {
    return null;
  }

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
};

const toUtcDayAt = (
  date: string | null | undefined,
  timeOfDayUtc: string,
): string | null => {
  const instant = toComparableDueDate(date);

  return isNull(instant) ? null : `${instant.slice(0, 10)}${timeOfDayUtc}`;
};

export const normalizeDueDate = (
  due: string | null | undefined,
): string | null => toUtcDayAt(due, DUE_TIME_OF_DAY_UTC);

// Google Tasks stores a day, not an instant: it records the date part and
// echoes it back at midnight UTC, so a time of day set in Twenty is lost on the
// next inbound sync.
export const toGoogleDueDate = (
  dueAt: string | null | undefined,
): string | null => toUtcDayAt(dueAt, GOOGLE_DUE_TIME_OF_DAY_UTC);
