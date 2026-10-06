/* @license Enterprise */

import { computeCreditTopUpAmountCents } from 'src/engine/core-modules/billing/utils/compute-credit-top-up-amount-cents.util';

const ONE_CREDIT_MICRO = 1_000_000;

describe('computeCreditTopUpAmountCents', () => {
  it('prices the pack at the rate of the given price', () => {
    expect(
      computeCreditTopUpAmountCents({
        creditAmountMicro: 50 * ONE_CREDIT_MICRO,
        unitAmountCents: 2_000,
        priceCreditAmountMicro: 20 * ONE_CREDIT_MICRO,
      }),
    ).toBe(5_000);
  });

  it('rounds a fraction of a cent up', () => {
    expect(
      computeCreditTopUpAmountCents({
        creditAmountMicro: 10 * ONE_CREDIT_MICRO,
        unitAmountCents: 1_000,
        priceCreditAmountMicro: 3 * ONE_CREDIT_MICRO,
      }),
    ).toBe(3_334);
  });

  it('stays exact where floating point would undercharge a cent', () => {
    expect(
      computeCreditTopUpAmountCents({
        creditAmountMicro: 500 * ONE_CREDIT_MICRO,
        unitAmountCents: 181_818_181_998,
        priceCreditAmountMicro: 999_999_999_989,
      }),
    ).toBe(90_909_092);
  });
});
