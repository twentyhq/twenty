/* @license Enterprise */

import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';

const getSeats = ({
  seatArrangements,
  type,
}: {
  seatArrangements: SeatBillingArrangement[];
  type: BillingArrangementType;
}): number =>
  seatArrangements.find((arrangement) => arrangement.type === type)?.seats ?? 0;

export const computeBilledSeats = ({
  memberCount,
  seatArrangements,
}: {
  memberCount: number;
  seatArrangements: SeatBillingArrangement[];
}): number =>
  Math.max(
    getSeats({
      seatArrangements,
      type: BillingArrangementType.COMMITTED_SEATS,
    }),
    memberCount -
      getSeats({ seatArrangements, type: BillingArrangementType.FREE_SEATS }),
    0,
  );
