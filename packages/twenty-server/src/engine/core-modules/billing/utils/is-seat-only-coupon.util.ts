/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import type Stripe from 'stripe';

export const isSeatOnlyCoupon = ({
  coupon,
  baseProductStripeIds,
}: {
  coupon: Pick<Stripe.Coupon, 'valid' | 'applies_to'>;
  baseProductStripeIds: Set<string>;
}): boolean => {
  const productIds = coupon.applies_to?.products;

  return (
    coupon.valid &&
    isNonEmptyArray(productIds) &&
    productIds.every((productId) => baseProductStripeIds.has(productId))
  );
};
