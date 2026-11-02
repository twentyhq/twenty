/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type StripeCouponDiscount } from 'src/engine/core-modules/billing/types/stripe-coupon-discount.type';
import { getStripeObjectId } from 'src/engine/core-modules/billing/utils/get-stripe-object-id.util';

export const toStripeCouponDiscount = (
  discount: Stripe.Discount,
): StripeCouponDiscount | null => {
  const coupon = discount.source.coupon;

  if (!isDefined(coupon)) {
    return null;
  }

  return {
    stripeCouponId: getStripeObjectId(coupon),
    startsAt: new Date(discount.start * 1000),
    endsAt: isDefined(discount.end) ? new Date(discount.end * 1000) : null,
  };
};
