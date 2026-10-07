/* @license Enterprise */

import { computeCreditOneTimeTopUpAmountCentsPerCredit } from 'src/engine/core-modules/billing/utils/compute-credit-one-time-top-up-amount-cents-per-credit.util';

describe('computeCreditOneTimeTopUpAmountCentsPerCredit', () => {
  it('prices one credit at the rate of the given price', () => {
    expect(
      computeCreditOneTimeTopUpAmountCentsPerCredit({
        unitAmount: 2_000,
        metadata: { credit_amount: '20000000' },
      }),
    ).toBe(100);
  });

  it('rounds a fraction of a cent up', () => {
    expect(
      computeCreditOneTimeTopUpAmountCentsPerCredit({
        unitAmount: 1_000,
        metadata: { credit_amount: '3000000' },
      }),
    ).toBe(334);
  });

  it('stays exact where floating point would overcharge a cent', () => {
    expect(
      computeCreditOneTimeTopUpAmountCentsPerCredit({
        unitAmount: 610_114_266_251,
        metadata: { credit_amount: '610114266251' },
      }),
    ).toBe(1_000_000);
  });
});
