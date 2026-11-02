/* @license Enterprise */

import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';

const getMaxSeats = (
  seatArrangements: SeatBillingArrangement[],
  type: BillingArrangementType,
): number =>
  Math.max(
    0,
    ...seatArrangements
      .filter((arrangement) => arrangement.type === type)
      .map((arrangement) => arrangement.seats ?? 0),
  );

export const computeBilledSeats = ({
  memberCount,
  seatArrangements,
}: {
  memberCount: number;
  seatArrangements: SeatBillingArrangement[];
}): number =>
  Math.max(
    getMaxSeats(seatArrangements, BillingArrangementType.COMMITTED_SEATS),
    memberCount -
      getMaxSeats(seatArrangements, BillingArrangementType.FREE_SEATS),
    0,
  );
