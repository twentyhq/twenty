/* @license Enterprise */

import { type UsagePeriod } from 'src/engine/core-modules/usage/types/usage-period.type';

// UTC so every instance stamps the same period boundaries regardless of the
// server's timezone.
export const getCalendarMonthPeriod = (now: Date): UsagePeriod => ({
  periodStart: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
  periodEnd: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
});
