/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type StripeDiscount } from 'src/engine/core-modules/billing/types/stripe-discount.type';

export const toStripeDiscount = (
  discount: Stripe.Discount,
): StripeDiscount => ({
  stripeDiscountId: discount.id,
  startsAt: new Date(discount.start * 1000),
  endsAt: isDefined(discount.end) ? new Date(discount.end * 1000) : null,
});
