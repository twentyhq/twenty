/* @license Enterprise */

import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

export const getCalendarDayPeriod = (now: Date): UsagePeriod => ({
  periodStart: new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ),
  periodEnd: new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  ),
});
