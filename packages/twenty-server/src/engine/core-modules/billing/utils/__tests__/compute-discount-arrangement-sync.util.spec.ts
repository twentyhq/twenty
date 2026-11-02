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
    stripeDiscountId: string;
    startsAt: Date;
    endsAt: Date | null;
    revokedAt: Date | null;
  }> = {},
) => ({
  id: 'arrangement-early',
  type: BillingArrangementType.DISCOUNT,
  stripeDiscountId: 'di_early',
  startsAt: LAST_MONTH,
  endsAt: null,
  revokedAt: null,
  ...overrides,
});

const EARLY_DISCOUNT = {
  stripeDiscountId: 'di_early',
  startsAt: LAST_MONTH,
  endsAt: null,
};

describe('computeDiscountArrangementSync', () => {
  it('records a discount that has no arrangement yet', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [],
        stripeDiscounts: [
          {
            stripeDiscountId: 'di_yc',
            startsAt: NOW,
            endsAt: NEXT_MONTH,
          },
        ],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: [],
      arrangementEndsAtUpdates: [],
      discountToRecord: {
        stripeDiscountId: 'di_yc',
        startsAt: NOW,
        endsAt: NEXT_MONTH,
      },
      unmirroredStripeDiscountIds: [],
    });
  });

  it('changes nothing when the active arrangement holds the live discount', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
        stripeDiscounts: [EARLY_DISCOUNT],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: [],
      arrangementEndsAtUpdates: [],
      discountToRecord: null,
      unmirroredStripeDiscountIds: [],
    });
  });

  it('takes the end date from Stripe when it differs', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
        stripeDiscounts: [{ ...EARLY_DISCOUNT, endsAt: NEXT_MONTH }],
        now: NOW,
      }).arrangementEndsAtUpdates,
    ).toEqual([{ arrangementId: 'arrangement-early', endsAt: NEXT_MONTH }]);
  });

  it('ends the active arrangement once Stripe has no discount left', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
        stripeDiscounts: [],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: ['arrangement-early'],
      arrangementEndsAtUpdates: [],
      discountToRecord: null,
      unmirroredStripeDiscountIds: [],
    });
  });

  it('ends the active arrangement when its discount already ended', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
        stripeDiscounts: [{ ...EARLY_DISCOUNT, endsAt: NOW }],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: ['arrangement-early'],
      arrangementEndsAtUpdates: [],
      discountToRecord: null,
      unmirroredStripeDiscountIds: [],
    });
  });

  it('replaces the arrangement when the same coupon comes back as a new discount', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
        stripeDiscounts: [
          { ...EARLY_DISCOUNT, stripeDiscountId: 'di_early_again' },
        ],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: ['arrangement-early'],
      arrangementEndsAtUpdates: [],
      discountToRecord: {
        ...EARLY_DISCOUNT,
        stripeDiscountId: 'di_early_again',
        startsAt: NOW,
      },
      unmirroredStripeDiscountIds: [],
    });
  });

  it('keeps the active arrangement and reports the other discounts when Stripe holds several', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
        stripeDiscounts: [
          {
            stripeDiscountId: 'di_yc',
            startsAt: NOW,
            endsAt: null,
          },
          EARLY_DISCOUNT,
        ],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: [],
      arrangementEndsAtUpdates: [],
      discountToRecord: null,
      unmirroredStripeDiscountIds: ['di_yc'],
    });
  });

  it('counts a discount listed on both the customer and the subscription once', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [buildDiscountArrangement()],
        stripeDiscounts: [EARLY_DISCOUNT, EARLY_DISCOUNT],
        now: NOW,
      }).unmirroredStripeDiscountIds,
    ).toEqual([]);
  });

  it('does not record a discount again once its arrangement was revoked', () => {
    expect(
      computeDiscountArrangementSync({
        discountArrangements: [
          buildDiscountArrangement({ revokedAt: YESTERDAY }),
        ],
        stripeDiscounts: [EARLY_DISCOUNT],
        now: NOW,
      }),
    ).toEqual({
      arrangementIdsToEnd: [],
      arrangementEndsAtUpdates: [],
      discountToRecord: null,
      unmirroredStripeDiscountIds: ['di_early'],
    });
  });

  describe('starts a recorded discount after every existing arrangement', () => {
    it('after a swap that ended the old arrangement but failed to record the new one', () => {
      expect(
        computeDiscountArrangementSync({
          discountArrangements: [
            buildDiscountArrangement({ endsAt: YESTERDAY }),
          ],
          stripeDiscounts: [
            {
              stripeDiscountId: 'di_nonprofit',
              startsAt: LAST_MONTH,
              endsAt: null,
            },
          ],
          now: NOW,
        }).discountToRecord?.startsAt,
      ).toEqual(YESTERDAY);
    });

    it('when a coupon is removed and another added within a second', () => {
      expect(
        computeDiscountArrangementSync({
          discountArrangements: [buildDiscountArrangement()],
          stripeDiscounts: [
            {
              stripeDiscountId: 'di_yc',
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
