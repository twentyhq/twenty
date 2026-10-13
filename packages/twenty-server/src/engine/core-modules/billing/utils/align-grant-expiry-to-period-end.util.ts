/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { getAnchorDayOfMonth } from 'src/engine/core-modules/billing/utils/get-anchor-day-of-month.util';
import { shiftUtcMonths } from 'src/engine/core-modules/billing/utils/shift-utc-months.util';

// Must cover the longest accepted validity on the shortest interval (13 monthly periods for a year);
// exceeding it returns a date short of the one asked for, so raise both together
const MAX_PERIODS_AHEAD = 24;

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

  const anchorDayOfMonth = getAnchorDayOfMonth({
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
