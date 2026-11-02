/* @license Enterprise */

import type Stripe from 'stripe';

import { toStripeCouponDiscount } from 'src/engine/core-modules/billing/utils/to-stripe-coupon-discount.util';

const buildDiscount = (overrides: Partial<Stripe.Discount>): Stripe.Discount =>
  ({
    id: 'di_1',
    start: 1_793_000_000,
    end: null,
    source: { coupon: 'coupon_early', type: 'coupon' },
    ...overrides,
  }) as Stripe.Discount;

describe('toStripeCouponDiscount', () => {
  it('maps a forever coupon discount with no end date', () => {
    expect(toStripeCouponDiscount(buildDiscount({}))).toEqual({
      stripeCouponId: 'coupon_early',
      startsAt: new Date(1_793_000_000 * 1000),
      endsAt: null,
    });
  });

  it('reads the coupon id from an expanded coupon and keeps the end date', () => {
    expect(
      toStripeCouponDiscount(
        buildDiscount({
          end: 1_801_000_000,
          source: {
            coupon: { id: 'coupon_yc' } as Stripe.Coupon,
            type: 'coupon',
          },
        }),
      ),
    ).toEqual({
      stripeCouponId: 'coupon_yc',
      startsAt: new Date(1_793_000_000 * 1000),
      endsAt: new Date(1_801_000_000 * 1000),
    });
  });

  it('skips a discount without a coupon', () => {
    expect(
      toStripeCouponDiscount(
        buildDiscount({ source: { coupon: null, type: 'coupon' } }),
      ),
    ).toBeNull();
  });
});
