/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { BillingArrangementStatus } from 'src/engine/core-modules/billing/enums/billing-arrangement-status.enum';
import { ONE_TIME_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';

export const getBillingArrangementStatus = ({
  arrangement,
  now,
}: {
  arrangement: BillingArrangementPeriod;
  now: Date;
}): BillingArrangementStatus => {
  if (ONE_TIME_BILLING_ARRANGEMENT_TYPES.includes(arrangement.type)) {
    return BillingArrangementStatus.ONE_TIME;
  }

  if (isBillingArrangementActive({ arrangement, now })) {
    return BillingArrangementStatus.ACTIVE;
  }

  if (arrangement.startsAt <= now) {
    return BillingArrangementStatus.ENDED;
  }

  const endDate = getBillingArrangementEndDate(arrangement);

  if (isDefined(endDate) && endDate <= arrangement.startsAt) {
    return BillingArrangementStatus.ENDED;
  }

  return BillingArrangementStatus.SCHEDULED;
};
