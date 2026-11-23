/* @license Enterprise */

import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';

export const getHardSeatCap = (
  seatArrangements: SeatBillingArrangement[],
): number | null =>
  seatArrangements.find(
    (arrangement) =>
      arrangement.type === BillingArrangementType.COMMITTED_SEATS &&
      arrangement.seatCapMode === BillingArrangementSeatCapMode.HARD,
  )?.seats ?? null;
