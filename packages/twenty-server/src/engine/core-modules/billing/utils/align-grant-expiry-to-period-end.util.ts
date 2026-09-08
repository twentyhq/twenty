/* @license Enterprise */

import { addMonths, addYears } from 'date-fns';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

// Bounds the walk so it cannot run away. Must stay above what the longest
// accepted validity needs on the shortest interval: a year of monthly periods
// is thirteen, so this leaves room to spare. Walking out of it returns a date
// short of the one asked for, so the accepted validity and this bound have to
// move together.
const MAX_PERIODS_AHEAD = 24;

const addPeriods = (
  anchor: Date,
  periods: number,
  interval: SubscriptionInterval,
): Date =>
  interval === SubscriptionInterval.Year
    ? addYears(anchor, periods)
    : addMonths(anchor, periods);

// A grant's expiry is always a period end. Both mechanisms that spend credits
// work a whole period at a time: the available credit count is cached until the
// period ends, and the carry-forward settles a period's usage against the
// grants that were live for it. A deadline inside a period is invisible to
// both, so the counter would keep spending credits that had lapsed and the
// settlement would let them absorb usage incurred after they died. Asking for
// thirty days therefore buys the period that day falls in, never less.
export const alignGrantExpiryToPeriodEnd = ({
  requestedExpiresAt,
  currentPeriodStart,
  currentPeriodEnd,
  interval,
}: {
  requestedExpiresAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  interval: SubscriptionInterval;
}): Date => {
  if (currentPeriodEnd.getTime() >= requestedExpiresAt.getTime()) {
    return currentPeriodEnd;
  }

  // Every later boundary is projected from the period start rather than by
  // stepping off the previous result. addMonths clamps January 31 to February
  // 28, and feeding that back in walks the rest onto the 28th, so a grant would
  // be stamped with dates the subscription never renews on and land mid-period
  // after all. Stripe re-expands to the anchor instead, which is what
  // projecting from a fixed start reproduces.
  for (
    let periodsAhead = 2;
    periodsAhead <= MAX_PERIODS_AHEAD;
    periodsAhead++
  ) {
    const periodEnd = addPeriods(currentPeriodStart, periodsAhead, interval);

    if (periodEnd.getTime() >= requestedExpiresAt.getTime()) {
      return periodEnd;
    }
  }

  return addPeriods(currentPeriodStart, MAX_PERIODS_AHEAD, interval);
};
