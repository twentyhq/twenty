import { createHash } from 'node:crypto';

const getUtcWeekStart = (date: Date): string => {
  const weekStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const daysSinceMonday = (weekStart.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);

  return weekStart.toISOString().slice(0, 10);
};

export const createWeeklyRotationKey = (
  partnerId: string,
  date = new Date(),
): string =>
  createHash('sha256')
    .update(`${partnerId}:${getUtcWeekStart(date)}`)
    .digest('hex');
