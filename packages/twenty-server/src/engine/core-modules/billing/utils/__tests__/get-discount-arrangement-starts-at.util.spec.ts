/* @license Enterprise */

import { getDiscountArrangementStartsAt } from 'src/engine/core-modules/billing/utils/get-discount-arrangement-starts-at.util';

const DISCOUNT_START = new Date('2026-11-25T10:00:00.000Z');

describe('getDiscountArrangementStartsAt', () => {
  it('starts at the Stripe discount start when nothing was recorded after it', () => {
    expect(
      getDiscountArrangementStartsAt({
        discountStartsAt: DISCOUNT_START,
        discountArrangements: [
          { endsAt: new Date('2026-10-01T00:00:00.000Z'), revokedAt: null },
        ],
      }),
    ).toEqual(DISCOUNT_START);
  });

  it('starts after the arrangement it replaces, which ends a moment after Stripe stamped the new discount', () => {
    const replacedAt = new Date('2026-11-25T10:00:01.000Z');

    expect(
      getDiscountArrangementStartsAt({
        discountStartsAt: DISCOUNT_START,
        discountArrangements: [{ endsAt: null, revokedAt: replacedAt }],
      }),
    ).toEqual(replacedAt);
  });
});
