/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';
import { computeBilledSeats } from 'src/engine/core-modules/billing/utils/compute-billed-seats.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';

export const isSeatLimitReached = ({
  memberCount,
  seatArrangements,
  now,
}: {
  memberCount: number;
  seatArrangements: SeatBillingArrangement[];
  now: Date;
}): boolean => {
  const activeArrangements = seatArrangements.filter((arrangement) =>
    isBillingArrangementActive({ arrangement, now }),
  );

  const hardCap = activeArrangements.find(
    (arrangement) =>
      arrangement.type === BillingArrangementType.COMMITTED_SEATS &&
      arrangement.seatCapMode === BillingArrangementSeatCapMode.HARD,
  );

  if (!isDefined(hardCap?.seats)) {
    return false;
  }

  return (
    computeBilledSeats({
      memberCount: memberCount + 1,
      seatArrangements: activeArrangements,
    }) > hardCap.seats
  );
};
