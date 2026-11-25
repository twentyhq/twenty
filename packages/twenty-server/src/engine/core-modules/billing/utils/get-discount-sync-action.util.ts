/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type DiscountSyncAction } from 'src/engine/core-modules/billing/types/discount-sync-action.type';
import { type StripeCouponDiscount } from 'src/engine/core-modules/billing/types/stripe-coupon-discount.type';

export const getDiscountSyncAction = ({
  activeStripeDiscountId,
  recordedStripeDiscountIds,
  liveDiscounts,
}: {
  activeStripeDiscountId: string | null;
  recordedStripeDiscountIds: Set<string>;
  liveDiscounts: StripeCouponDiscount[];
}): DiscountSyncAction => {
  if (
    liveDiscounts.some(
      ({ stripeDiscountId }) => stripeDiscountId === activeStripeDiscountId,
    )
  ) {
    return { type: 'NONE' };
  }

  const newDiscount = liveDiscounts.find(
    ({ stripeDiscountId }) => !recordedStripeDiscountIds.has(stripeDiscountId),
  );

  if (isDefined(newDiscount)) {
    return { type: 'START', discount: newDiscount };
  }

  return isDefined(activeStripeDiscountId) ? { type: 'END' } : { type: 'NONE' };
};
