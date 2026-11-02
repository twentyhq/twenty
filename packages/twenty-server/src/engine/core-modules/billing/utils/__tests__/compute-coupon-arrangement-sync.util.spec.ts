/* @license Enterprise */

import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { computeCouponArrangementSync } from 'src/engine/core-modules/billing/utils/compute-coupon-arrangement-sync.util';

const NOW = new Date('2026-10-30T12:00:00Z');
const LAST_MONTH = new Date('2026-09-30T12:00:00Z');
const NEXT_MONTH = new Date('2026-11-30T12:00:00Z');

const buildCouponArrangement = (
  overrides: Partial<{
    id: string;
    stripeCouponId: string;
    startsAt: Date;
    endsAt: Date | null;
    revokedAt: Date | null;
  }> = {},
) => ({
  id: 'arrangement-early',
  type: BillingArrangementType.COUPON,
  stripeCouponId: 'coupon_early',
  startsAt: LAST_MONTH,
  endsAt: null,
  revokedAt: null,
  ...overrides,
});

describe('computeCouponArrangementSync', () => {
  it('records a discount that has no arrangement yet', () => {
    expect(
      computeCouponArrangementSync({
        couponArrangements: [],
        stripeCouponDiscounts: [
          { stripeCouponId: 'coupon_yc', startsAt: NOW, endsAt: NEXT_MONTH },
        ],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: [],
      arrangementEndsAtUpdate: null,
      discountToRecord: {
        stripeCouponId: 'coupon_yc',
        startsAt: NOW,
        endsAt: NEXT_MONTH,
      },
    });
  });

  it('changes nothing when the active arrangement matches the discount', () => {
    expect(
      computeCouponArrangementSync({
        couponArrangements: [buildCouponArrangement()],
        stripeCouponDiscounts: [
          {
            stripeCouponId: 'coupon_early',
            startsAt: LAST_MONTH,
            endsAt: null,
          },
        ],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: [],
      arrangementEndsAtUpdate: null,
      discountToRecord: null,
    });
  });

  it('takes the end date from Stripe when it differs', () => {
    expect(
      computeCouponArrangementSync({
        couponArrangements: [buildCouponArrangement()],
        stripeCouponDiscounts: [
          {
            stripeCouponId: 'coupon_early',
            startsAt: LAST_MONTH,
            endsAt: NEXT_MONTH,
          },
        ],
        now: NOW,
      }).arrangementEndsAtUpdate,
    ).toEqual({ arrangementId: 'arrangement-early', endsAt: NEXT_MONTH });
  });

  it('ends the active arrangement once Stripe has no discount left', () => {
    expect(
      computeCouponArrangementSync({
        couponArrangements: [buildCouponArrangement()],
        stripeCouponDiscounts: [],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: ['arrangement-early'],
      arrangementEndsAtUpdate: null,
      discountToRecord: null,
    });
  });

  it('ignores a discount that already ended', () => {
    expect(
      computeCouponArrangementSync({
        couponArrangements: [buildCouponArrangement()],
        stripeCouponDiscounts: [
          { stripeCouponId: 'coupon_early', startsAt: LAST_MONTH, endsAt: NOW },
        ],
        now: NOW,
      }).arrangementIdsToEnd,
    ).toEqual(['arrangement-early']);
  });

  it('replaces the arrangement when Stripe swapped the coupon, starting the new one after it', () => {
    expect(
      computeCouponArrangementSync({
        couponArrangements: [buildCouponArrangement()],
        stripeCouponDiscounts: [
          {
            stripeCouponId: 'coupon_nonprofit',
            startsAt: LAST_MONTH,
            endsAt: null,
          },
        ],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: ['arrangement-early'],
      arrangementEndsAtUpdate: null,
      discountToRecord: {
        stripeCouponId: 'coupon_nonprofit',
        startsAt: NOW,
        endsAt: null,
      },
    });
  });

  it('keeps the discount matching the active arrangement when Stripe holds several', () => {
    expect(
      computeCouponArrangementSync({
        couponArrangements: [buildCouponArrangement()],
        stripeCouponDiscounts: [
          { stripeCouponId: 'coupon_yc', startsAt: NOW, endsAt: null },
          {
            stripeCouponId: 'coupon_early',
            startsAt: LAST_MONTH,
            endsAt: null,
          },
        ],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: [],
      arrangementEndsAtUpdate: null,
      discountToRecord: null,
    });
  });

  it('records the discount again when its arrangement was ended early', () => {
    expect(
      computeCouponArrangementSync({
        couponArrangements: [buildCouponArrangement({ revokedAt: LAST_MONTH })],
        stripeCouponDiscounts: [
          {
            stripeCouponId: 'coupon_early',
            startsAt: LAST_MONTH,
            endsAt: null,
          },
        ],
        now: NOW,
      }).discountToRecord,
    ).toEqual({
      stripeCouponId: 'coupon_early',
      startsAt: LAST_MONTH,
      endsAt: null,
    });
  });
});
