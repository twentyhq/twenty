/* @license Enterprise */

import type Stripe from 'stripe';

import { isSeatOnlyCoupon } from 'src/engine/core-modules/billing/utils/is-seat-only-coupon.util';

const baseProductStripeIds = new Set(['prod_pro', 'prod_organization']);

const buildCoupon = (
  overrides: Partial<Pick<Stripe.Coupon, 'valid' | 'applies_to'>>,
) => ({
  valid: true,
  applies_to: { products: ['prod_pro'] },
  ...overrides,
});

describe('isSeatOnlyCoupon', () => {
  it('accepts a valid coupon restricted to plan seat products', () => {
    expect(
      isSeatOnlyCoupon({
        coupon: buildCoupon({
          applies_to: { products: ['prod_pro', 'prod_organization'] },
        }),
        baseProductStripeIds,
      }),
    ).toBe(true);
  });

  it('rejects a coupon with no product restriction, which would also discount the credit pack', () => {
    expect(
      isSeatOnlyCoupon({
        coupon: buildCoupon({ applies_to: undefined }),
        baseProductStripeIds,
      }),
    ).toBe(false);
  });

  it('rejects a coupon that also applies to another product', () => {
    expect(
      isSeatOnlyCoupon({
        coupon: buildCoupon({
          applies_to: { products: ['prod_pro', 'prod_credit_pack'] },
        }),
        baseProductStripeIds,
      }),
    ).toBe(false);
  });

  it('rejects a coupon that can no longer be redeemed', () => {
    expect(
      isSeatOnlyCoupon({
        coupon: buildCoupon({ valid: false }),
        baseProductStripeIds,
      }),
    ).toBe(false);
  });
});
