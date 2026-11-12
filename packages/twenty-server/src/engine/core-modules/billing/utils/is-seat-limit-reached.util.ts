/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';
import { computeBilledSeats } from 'src/engine/core-modules/billing/utils/compute-billed-seats.util';
import { getHardSeatCap } from 'src/engine/core-modules/billing/utils/get-hard-seat-cap.util';

export const isSeatLimitReached = ({
  memberCount,
  seatArrangements,
}: {
  memberCount: number;
  seatArrangements: SeatBillingArrangement[];
}): boolean => {
  const hardSeatCap = getHardSeatCap(seatArrangements);

  if (!isDefined(hardSeatCap)) {
    return false;
  }

  return (
    computeBilledSeats({
      memberCount: memberCount + 1,
      seatArrangements,
    }) > hardSeatCap
  );
};
