/* @license Enterprise */

import { computeCreditOneTimeTopUpAmountCents } from 'src/engine/core-modules/billing/utils/compute-credit-one-time-top-up-amount-cents.util';

const ONE_CREDIT_MICRO = 1_000_000;

describe('computeCreditOneTimeTopUpAmountCents', () => {
  it('prices the pack at the rate of the given price', () => {
    expect(
      computeCreditOneTimeTopUpAmountCents({
        creditAmountMicro: 50 * ONE_CREDIT_MICRO,
        price: {
          unitAmount: 2_000,
          metadata: { credit_amount: String(20 * ONE_CREDIT_MICRO) },
        },
      }),
    ).toBe(5_000);
  });

  it('rounds a fraction of a cent up', () => {
    expect(
      computeCreditOneTimeTopUpAmountCents({
        creditAmountMicro: 10 * ONE_CREDIT_MICRO,
        price: {
          unitAmount: 1_000,
          metadata: { credit_amount: String(3 * ONE_CREDIT_MICRO) },
        },
      }),
    ).toBe(3_334);
  });

  it('stays exact where floating point would undercharge a cent', () => {
    expect(
      computeCreditOneTimeTopUpAmountCents({
        creditAmountMicro: 500 * ONE_CREDIT_MICRO,
        price: {
          unitAmount: 181_818_181_998,
          metadata: { credit_amount: '999999999989' },
        },
      }),
    ).toBe(90_909_092);
  });
});
