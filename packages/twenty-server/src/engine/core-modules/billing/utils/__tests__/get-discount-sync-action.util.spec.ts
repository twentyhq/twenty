/* @license Enterprise */

import { getDiscountSyncAction } from 'src/engine/core-modules/billing/utils/get-discount-sync-action.util';

const buildDiscount = (stripeDiscountId: string) => ({
  stripeDiscountId,
  stripeCouponId: 'coupon_early',
  startsAt: new Date('2026-11-01T00:00:00.000Z'),
  endsAt: null,
});

describe('getDiscountSyncAction', () => {
  it('does nothing when the active arrangement matches a live discount', () => {
    expect(
      getDiscountSyncAction({
        activeStripeDiscountId: 'di_early',
        recordedStripeDiscountIds: new Set(['di_early']),
        liveDiscounts: [buildDiscount('di_early')],
      }),
    ).toEqual({ type: 'NONE' });
  });

  it('records a discount added in Stripe', () => {
    expect(
      getDiscountSyncAction({
        activeStripeDiscountId: null,
        recordedStripeDiscountIds: new Set(),
        liveDiscounts: [buildDiscount('di_yc')],
      }),
    ).toEqual({ type: 'START', discount: buildDiscount('di_yc') });
  });

  it('replaces the active arrangement when Stripe swapped the discount', () => {
    expect(
      getDiscountSyncAction({
        activeStripeDiscountId: 'di_early',
        recordedStripeDiscountIds: new Set(['di_early']),
        liveDiscounts: [buildDiscount('di_non_profit')],
      }),
    ).toEqual({ type: 'START', discount: buildDiscount('di_non_profit') });
  });

  it('ends the active arrangement when Stripe has no discount left', () => {
    expect(
      getDiscountSyncAction({
        activeStripeDiscountId: 'di_early',
        recordedStripeDiscountIds: new Set(['di_early']),
        liveDiscounts: [],
      }),
    ).toEqual({ type: 'END' });
  });

  it('never records a discount twice, even after its arrangement ended', () => {
    expect(
      getDiscountSyncAction({
        activeStripeDiscountId: null,
        recordedStripeDiscountIds: new Set(['di_early']),
        liveDiscounts: [buildDiscount('di_early')],
      }),
    ).toEqual({ type: 'NONE' });
  });
});
