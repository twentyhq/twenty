/* @license Enterprise */

import {
  addMonths,
  addYears,
  getDate,
  getDaysInMonth,
  setDate,
} from 'date-fns';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

// Bounds the walk so it cannot run away. Must stay above what the longest
// accepted validity needs on the shortest interval: a year of monthly periods
// is thirteen, so this leaves room to spare. Walking out of it returns a date
// short of the one asked for, so the accepted validity and this bound have to
// move together.
const MAX_PERIODS_AHEAD = 24;

// Stripe keeps the day a subscription was anchored on and clamps it to each
// short month, so a subscription anchored on the 31st renews Jan 31, Feb 28,
// Mar 31. Neither stored boundary is reliably the anchor once it has renewed
// into a short month, so take the later day of the two: for monthly periods
// that is always the anchor, since no two consecutive months are short enough
// to clamp the same one.
//
// Yearly periods have one case the two dates cannot settle, a Feb 29 anchor
// read between leap years, where both say 28. Reading it as 28 leaves a
// deadline a day short of a leap-year boundary; reading it as 29 would push it
// past a common-year one and buy a whole extra period, so the low reading is
// the one worth keeping. Recovering the anchor this way avoids having to
// persist Stripe's billing_cycle_anchor.
const resolveAnchorDayOfMonth = (periodStart: Date, periodEnd: Date): number =>
  Math.max(getDate(periodStart), getDate(periodEnd));

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
  const shifted =
    interval === SubscriptionInterval.Year
      ? addYears(periodStart, periodsAhead)
      : addMonths(periodStart, periodsAhead);

  // Re-expands the anchor that addMonths clamped away, and clamps it again for
  // the month actually landed on.
  return setDate(shifted, Math.min(anchorDayOfMonth, getDaysInMonth(shifted)));
};

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
  // Known exactly, and the only boundary that survives a period whose length
  // was changed by a plan switch rather than by the schedule.
  if (currentPeriodEnd.getTime() >= requestedExpiresAt.getTime()) {
    return currentPeriodEnd;
  }

  const anchorDayOfMonth = resolveAnchorDayOfMonth(
    currentPeriodStart,
    currentPeriodEnd,
  );

  // Every later boundary is projected from the period start rather than by
  // stepping off the previous result, which would walk a month-end anchor down
  // to the 28th and stamp the grant with days the subscription never renews on,
  // putting the deadline back inside a period.
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
