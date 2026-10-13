/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { getAnchorDayOfMonth } from 'src/engine/core-modules/billing/utils/get-anchor-day-of-month.util';
import { shiftUtcMonths } from 'src/engine/core-modules/billing/utils/shift-utc-months.util';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

// A yearly period holds 12 or 13 slices; the cap only bounds the loop
const MAX_SLICES_PER_PERIOD = 24;

const isLastDayOfUtcMonth = (date: Date): boolean =>
  date.getUTCDate() ===
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();

// Only a start Stripe clamped to a month end carries a lower day than its anchor; any other day mismatch comes from a resized period
const getYearlySliceAnchorDayOfMonth = ({
  periodStart,
  periodEnd,
}: {
  periodStart: Date;
  periodEnd: Date;
}): number => {
  const isStartClamped =
    isLastDayOfUtcMonth(periodStart) &&
    periodEnd.getUTCDate() > periodStart.getUTCDate();

  return isStartClamped
    ? getAnchorDayOfMonth({ periodStart, periodEnd })
    : periodStart.getUTCDate();
};

export const computeMemberCreditsSlice = ({
  currentPeriodStart,
  currentPeriodEnd,
  interval,
  status,
  now,
}: {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  interval: SubscriptionInterval;
  status: SubscriptionStatus;
  now: Date;
}): UsagePeriod | null => {
  // Outside the cached period the entry is stale: no slice, so the spend stays workspace-funded
  if (
    now.getTime() < currentPeriodStart.getTime() ||
    now.getTime() >= currentPeriodEnd.getTime()
  ) {
    return null;
  }

  if (
    status === SubscriptionStatus.Trialing ||
    interval !== SubscriptionInterval.Year
  ) {
    return { periodStart: currentPeriodStart, periodEnd: currentPeriodEnd };
  }

  const anchorDayOfMonth = getYearlySliceAnchorDayOfMonth({
    periodStart: currentPeriodStart,
    periodEnd: currentPeriodEnd,
  });

  // Shifted from the period start, never from the previous boundary, so a 31st anchor comes back after a short month
  const getSliceBoundary = (sliceIndex: number): Date =>
    sliceIndex === 0
      ? currentPeriodStart
      : shiftUtcMonths({
          date: currentPeriodStart,
          months: sliceIndex,
          dayOfMonth: anchorDayOfMonth,
        });

  let sliceIndex = 0;

  while (
    sliceIndex < MAX_SLICES_PER_PERIOD &&
    getSliceBoundary(sliceIndex + 1).getTime() <= now.getTime()
  ) {
    sliceIndex++;
  }

  const nextSliceBoundary = getSliceBoundary(sliceIndex + 1);

  return {
    periodStart: getSliceBoundary(sliceIndex),
    // A yearly period cut short by an anchor reset or a plan switch ends its last slice with the period
    periodEnd:
      nextSliceBoundary.getTime() < currentPeriodEnd.getTime()
        ? nextSliceBoundary
        : currentPeriodEnd,
  };
};
