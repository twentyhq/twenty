/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { shiftUtcMonths } from 'src/engine/core-modules/billing/utils/shift-utc-months.util';

// Must cover the longest accepted validity on the shortest interval (13 monthly periods for a year)
const MAX_PERIODS_AHEAD = 24;

// Stripe clamps the anchor day to short months, so the later day of the two boundaries recovers it
// A Feb 29 yearly anchor reads as 28 between leap years; the low reading avoids buying a whole extra period
const resolveAnchorDayOfMonth = ({
  periodStart,
  periodEnd,
}: {
  periodStart: Date;
  periodEnd: Date;
}): number => Math.max(periodStart.getUTCDate(), periodEnd.getUTCDate());

const projectPeriodEnd = ({
  periodStart,
  anchorDayOfMonth,
  periodsAhead,
  interval,
}: {
  periodStart: Date;
  anchorDayOfMonth: number;
  periodsAhead: number;
  interval: SubscriptionInterval;
}): Date => {
  const monthsAhead =
    interval === SubscriptionInterval.Year ? periodsAhead * 12 : periodsAhead;

  return shiftUtcMonths({
    date: periodStart,
    months: monthsAhead,
    dayOfMonth: anchorDayOfMonth,
  });
};

// Always a period end: the cached credit count and the carry-forward both work a whole period at a time
export const alignGrantExpiryToPeriodEnd = ({
  requestedExpiresAt,
  currentPeriodStart,
  currentPeriodEnd,
  interval,
}: {
  requestedExpiresAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  // Nullable: without it the current period end is the last nameable boundary
  interval: SubscriptionInterval | null | undefined;
}): Date => {
  // The only boundary that survives a period resized by a plan switch
  if (
    currentPeriodEnd.getTime() >= requestedExpiresAt.getTime() ||
    !isDefined(interval)
  ) {
    return currentPeriodEnd;
  }

  const anchorDayOfMonth = resolveAnchorDayOfMonth({
    periodStart: currentPeriodStart,
    periodEnd: currentPeriodEnd,
  });

  // Projected from the period start: stepping off the previous result walks month-end anchors down to the 28th
  let periodEnd = currentPeriodEnd;

  for (
    let periodsAhead = 2;
    periodsAhead <= MAX_PERIODS_AHEAD;
    periodsAhead++
  ) {
    periodEnd = projectPeriodEnd({
      periodStart: currentPeriodStart,
      anchorDayOfMonth,
      periodsAhead,
      interval,
    });

    if (periodEnd.getTime() >= requestedExpiresAt.getTime()) {
      break;
    }
  }

  return periodEnd;
};
