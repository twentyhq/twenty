/* @license Enterprise */

import type Stripe from 'stripe';

import { toStripeDiscount } from 'src/engine/core-modules/billing/utils/to-stripe-discount.util';

const buildDiscount = (overrides: Partial<Stripe.Discount>): Stripe.Discount =>
  ({
    id: 'di_1',
    start: 1_793_000_000,
    end: null,
    source: { coupon: 'coupon_early', type: 'coupon' },
    ...overrides,
  }) as Stripe.Discount;

describe('toStripeDiscount', () => {
  it('maps a forever discount with no end date', () => {
    expect(toStripeDiscount(buildDiscount({}))).toEqual({
      stripeDiscountId: 'di_1',
      startsAt: new Date(1_793_000_000 * 1000),
      endsAt: null,
    });
  });

  it('keeps the end date of a repeating discount', () => {
    expect(toStripeDiscount(buildDiscount({ end: 1_801_000_000 }))).toEqual({
      stripeDiscountId: 'di_1',
      startsAt: new Date(1_793_000_000 * 1000),
      endsAt: new Date(1_801_000_000 * 1000),
    });
  });
});
