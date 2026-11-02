/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';
import { type SeatSyncPlan } from 'src/engine/core-modules/billing/types/seat-sync-plan.type';
import { computeBilledSeats } from 'src/engine/core-modules/billing/utils/compute-billed-seats.util';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';

const isEffectiveDuringCurrentPeriod = ({
  arrangement,
  now,
  currentPeriodStart,
}: {
  arrangement: SeatBillingArrangement;
  now: Date;
  currentPeriodStart: Date;
}): boolean => {
  const endDate = getBillingArrangementEndDate(arrangement);

  return (
    arrangement.startsAt <= now &&
    (!isDefined(endDate) ||
      (endDate > currentPeriodStart && endDate > arrangement.startsAt))
  );
};

export const computeSeatSyncPlan = ({
  memberCount,
  currentSeats,
  seatArrangements,
  now,
  currentPeriodStart,
  currentPeriodEnd,
  isTrialing,
}: {
  memberCount: number;
  currentSeats: number;
  seatArrangements: SeatBillingArrangement[];
  now: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  isTrialing: boolean;
}): SeatSyncPlan => {
  if (isTrialing) {
    return {
      currentPeriodSeats: computeBilledSeats({
        memberCount,
        seatArrangements: seatArrangements.filter((arrangement) =>
          isBillingArrangementActive({ arrangement, now }),
        ),
      }),
      nextPeriodSeats: null,
    };
  }

  const currentPeriodArrangements = seatArrangements.filter((arrangement) =>
    isEffectiveDuringCurrentPeriod({ arrangement, now, currentPeriodStart }),
  );
  const nextPeriodArrangements = seatArrangements.filter((arrangement) =>
    isBillingArrangementActive({ arrangement, now: currentPeriodEnd }),
  );

  if (
    currentPeriodArrangements.length === 0 &&
    nextPeriodArrangements.length === 0
  ) {
    return { currentPeriodSeats: memberCount, nextPeriodSeats: null };
  }

  return {
    currentPeriodSeats: Math.max(
      currentSeats,
      computeBilledSeats({
        memberCount,
        seatArrangements: currentPeriodArrangements,
      }),
    ),
    nextPeriodSeats: computeBilledSeats({
      memberCount,
      seatArrangements: nextPeriodArrangements,
    }),
  };
};
