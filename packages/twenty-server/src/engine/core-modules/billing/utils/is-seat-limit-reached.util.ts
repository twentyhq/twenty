/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';
import { computeBilledSeats } from 'src/engine/core-modules/billing/utils/compute-billed-seats.util';

export const isSeatLimitReached = ({
  memberCount,
  seatArrangements,
}: {
  memberCount: number;
  seatArrangements: SeatBillingArrangement[];
}): boolean => {
  const hardCap = seatArrangements.find(
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
      seatArrangements,
    }) > hardCap.seats
  );
};
