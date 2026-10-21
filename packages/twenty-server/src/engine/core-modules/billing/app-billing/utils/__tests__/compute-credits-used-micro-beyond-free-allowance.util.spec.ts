import { computeCreditsUsedMicroBeyondFreeAllowance } from 'src/engine/core-modules/billing/app-billing/utils/compute-credits-used-micro-beyond-free-allowance.util';

describe('computeCreditsUsedMicroBeyondFreeAllowance', () => {
  it('should bill nothing when the allowance covers the whole charge', () => {
    expect(
      computeCreditsUsedMicroBeyondFreeAllowance({
        creditsUsedMicro: 1_000_000,
        quantity: 60,
        freeQuantityRemaining: 60,
      }),
    ).toBe(0);
  });

  it('should bill only the part beyond the remaining allowance', () => {
    expect(
      computeCreditsUsedMicroBeyondFreeAllowance({
        creditsUsedMicro: 1_000_000,
        quantity: 60,
        freeQuantityRemaining: 15,
      }),
    ).toBe(750_000);
  });

  it('should bill in full once the allowance is spent', () => {
    expect(
      computeCreditsUsedMicroBeyondFreeAllowance({
        creditsUsedMicro: 1_000_000,
        quantity: 60,
        freeQuantityRemaining: 0,
      }),
    ).toBe(1_000_000);
  });

  it('should bill in full when earlier charges overshot the allowance', () => {
    expect(
      computeCreditsUsedMicroBeyondFreeAllowance({
        creditsUsedMicro: 1_000_000,
        quantity: 60,
        freeQuantityRemaining: -30,
      }),
    ).toBe(1_000_000);
  });

  it('should round to a whole micro-credit', () => {
    expect(
      computeCreditsUsedMicroBeyondFreeAllowance({
        creditsUsedMicro: 1_000_000,
        quantity: 3,
        freeQuantityRemaining: 1,
      }),
    ).toBe(666_667);
  });
});
