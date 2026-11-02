/* @license Enterprise */

import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { computeDiscountArrangementSync } from 'src/engine/core-modules/billing/utils/compute-discount-arrangement-sync.util';

const NOW = new Date('2026-10-30T12:00:00Z');
const ONE_SECOND_AGO = new Date('2026-10-30T11:59:59Z');
const YESTERDAY = new Date('2026-10-29T12:00:00Z');
const LAST_MONTH = new Date('2026-09-30T12:00:00Z');
const NEXT_MONTH = new Date('2026-11-30T12:00:00Z');

const buildDiscountArrangement = (
  overrides: Partial<{
    id: string;
    stripeCouponId: string;
    startsAt: Date;
    endsAt: Date | null;
    revokedAt: Date | null;
  }> = {},
) => ({
  id: 'arrangement-early',
  type: BillingArrangementType.DISCOUNT,
  stripeCouponId: 'coupon_early',
  startsAt: LAST_MONTH,
  endsAt: null,
  revokedAt: null,
  ...overrides,
});

describe('computeDiscountArrangementSync', () => {
  it('records a discount that has no arrangement yet', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [],
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
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
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
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
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
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
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
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
        stripeCouponDiscounts: [
          { stripeCouponId: 'coupon_early', startsAt: LAST_MONTH, endsAt: NOW },
        ],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: ['arrangement-early'],
      arrangementEndsAtUpdate: null,
      discountToRecord: null,
    });
  });

  it('replaces the arrangement when Stripe swapped the coupon, starting the new one after it', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
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
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
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

  describe('starts a recorded discount after every existing arrangement', () => {
    it('after a swap that ended the old arrangement but failed to record the new one', () => {
      expect(
        computeDiscountArrangementSync({
          discountArrangements: [
            buildDiscountArrangement({ endsAt: YESTERDAY }),
          ],
          stripeCouponDiscounts: [
            {
              stripeCouponId: 'coupon_nonprofit',
              startsAt: LAST_MONTH,
              endsAt: null,
            },
          ],
          now: NOW,
        }).discountToRecord?.startsAt,
      ).toEqual(YESTERDAY);
    });

    it('after an arrangement ended early while Stripe still holds its coupon', () => {
      expect(
        computeDiscountArrangementSync({
          discountArrangements: [
            buildDiscountArrangement({ revokedAt: YESTERDAY }),
          ],
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
        startsAt: YESTERDAY,
        endsAt: null,
      });
    });

    it('when a coupon is removed and another added within a second', () => {
      expect(
        computeDiscountArrangementSync({
          discountArrangements: [buildDiscountArrangement()],
          stripeCouponDiscounts: [
            {
              stripeCouponId: 'coupon_yc',
              startsAt: ONE_SECOND_AGO,
              endsAt: NEXT_MONTH,
            },
          ],
          now: NOW,
        }).discountToRecord?.startsAt,
      ).toEqual(NOW);
    });
  });
});
