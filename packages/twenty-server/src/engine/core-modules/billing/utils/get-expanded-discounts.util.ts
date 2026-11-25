/* @license Enterprise */

import { isString } from '@sniptt/guards';

import type Stripe from 'stripe';

export const getExpandedDiscounts = (
  discounts: Array<string | Stripe.Discount>,
): Stripe.Discount[] =>
  discounts.filter(
    (discount): discount is Stripe.Discount => !isString(discount),
  );
