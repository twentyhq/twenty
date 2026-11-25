/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';

// Stripe stamps the discount before the previous arrangement is ended, so start after every recorded one to never overlap
export const getDiscountArrangementStartsAt = ({
  discountStartsAt,
  discountArrangements,
}: {
  discountStartsAt: Date;
  discountArrangements: Pick<
    BillingArrangementPeriod,
    'endsAt' | 'revokedAt'
  >[];
}): Date =>
  discountArrangements
    .map(getBillingArrangementEndDate)
    .filter(isDefined)
    .reduce(
      (latestDate, endDate) => (endDate > latestDate ? endDate : latestDate),
      discountStartsAt,
    );
