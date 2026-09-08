/* @license Enterprise */

import { addMonths, addYears } from 'date-fns';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

// Bounds the walk so a period end that never advances cannot hang it. Must stay
// above what the longest accepted validity needs on the shortest interval: a
// year of monthly periods is thirteen, so this leaves room to spare. Walking
// out of it returns a date short of the one asked for, so the accepted validity
// and this bound have to move together.
const MAX_PERIODS_AHEAD = 24;

// A grant's expiry is always a period end. Both mechanisms that spend credits
// work a whole period at a time: the available credit count is cached until the
// period ends, and the carry-forward settles a period's usage against the
// grants that were live for it. A deadline inside a period is invisible to
// both, so the counter would keep spending credits that had lapsed and the
// settlement would let them absorb usage incurred after they died. Asking for
// thirty days therefore buys the period that day falls in, never less.
export const alignGrantExpiryToPeriodEnd = ({
  requestedExpiresAt,
  currentPeriodEnd,
  interval,
}: {
  requestedExpiresAt: Date;
  currentPeriodEnd: Date;
  interval: SubscriptionInterval;
}): Date => {
  let periodEnd = currentPeriodEnd;

  for (let periodsAhead = 0; periodsAhead < MAX_PERIODS_AHEAD; periodsAhead++) {
    if (periodEnd.getTime() >= requestedExpiresAt.getTime()) {
      return periodEnd;
    }

    periodEnd =
      interval === SubscriptionInterval.Year
        ? addYears(periodEnd, 1)
        : addMonths(periodEnd, 1);
  }

  return periodEnd;
};
