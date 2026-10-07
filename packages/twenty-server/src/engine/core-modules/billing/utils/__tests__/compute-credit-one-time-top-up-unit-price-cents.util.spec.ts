/* @license Enterprise */

import { computeCreditOneTimeTopUpUnitPriceCents } from 'src/engine/core-modules/billing/utils/compute-credit-one-time-top-up-unit-price-cents.util';

describe('computeCreditOneTimeTopUpUnitPriceCents', () => {
  it('prices one credit at the rate of the given price', () => {
    expect(
      computeCreditOneTimeTopUpUnitPriceCents({
        unitAmount: 2_000,
        metadata: { credit_amount: '20000000' },
      }),
    ).toBe(100);
  });

  it('rounds a fraction of a cent up', () => {
    expect(
      computeCreditOneTimeTopUpUnitPriceCents({
        unitAmount: 1_000,
        metadata: { credit_amount: '3000000' },
      }),
    ).toBe(334);
  });

  it('stays exact where floating point would overcharge a cent', () => {
    expect(
      computeCreditOneTimeTopUpUnitPriceCents({
        unitAmount: 610_114_266_251,
        metadata: { credit_amount: '610114266251' },
      }),
    ).toBe(1_000_000);
  });
});
