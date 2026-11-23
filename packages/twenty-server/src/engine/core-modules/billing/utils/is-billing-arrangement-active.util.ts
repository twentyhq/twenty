/* @license Enterprise */

import { ONE_TIME_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';
import { isWithinBillingArrangementWindow } from 'src/engine/core-modules/billing/utils/is-within-billing-arrangement-window.util';

export const isBillingArrangementActive = ({
  arrangement,
  now,
}: {
  arrangement: BillingArrangementPeriod;
  now: Date;
}): boolean => {
  if (ONE_TIME_BILLING_ARRANGEMENT_TYPES.includes(arrangement.type)) {
    return false;
  }

  return isWithinBillingArrangementWindow({
    startsAtMs: arrangement.startsAt.getTime(),
    endsAtMs: getBillingArrangementEndDate(arrangement)?.getTime() ?? null,
    nowMs: now.getTime(),
  });
};
