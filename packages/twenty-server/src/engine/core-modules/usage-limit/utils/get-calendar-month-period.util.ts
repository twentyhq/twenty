/* @license Enterprise */

import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

export const getCalendarMonthPeriod = (now: Date): UsagePeriod => ({
  periodStart: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
  periodEnd: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
});
