/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';

export const getBillingArrangementEndDate = ({
  endsAt,
  revokedAt,
}: Pick<BillingArrangementPeriod, 'endsAt' | 'revokedAt'>): Date | null => {
  if (!isDefined(revokedAt)) {
    return endsAt;
  }

  if (!isDefined(endsAt)) {
    return revokedAt;
  }

  return revokedAt < endsAt ? revokedAt : endsAt;
};
