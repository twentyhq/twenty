/* @license Enterprise */

import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

export const getCalendarWeekPeriod = (now: Date): UsagePeriod => {
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;

  return {
    periodStart: new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - daysSinceMonday,
      ),
    ),
    periodEnd: new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - daysSinceMonday + 7,
      ),
    ),
  };
};
