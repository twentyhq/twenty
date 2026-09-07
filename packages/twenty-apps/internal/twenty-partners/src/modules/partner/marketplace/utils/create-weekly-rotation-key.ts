import { createHash } from 'node:crypto';

const getUtcWeekStart = (date: Date): string => {
  const weekStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const daysSinceMonday = (weekStart.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);

  return weekStart.toISOString().slice(0, 10);
};

// The date is required: a caller reading the clock per partner would mix keys
// from two weeks whenever a request crosses the UTC Monday boundary.
export const createWeeklyRotationKey = (
  partnerId: string,
  date: Date,
): string =>
  createHash('sha256')
    .update(`${partnerId}:${getUtcWeekStart(date)}`)
    .digest('hex');
