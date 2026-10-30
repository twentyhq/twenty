/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { ONE_TIME_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';

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

  const endDate = getBillingArrangementEndDate(arrangement);

  return arrangement.startsAt <= now && (!isDefined(endDate) || endDate > now);
};
