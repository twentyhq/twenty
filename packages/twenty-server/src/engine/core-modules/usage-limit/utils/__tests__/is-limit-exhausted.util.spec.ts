import { isLimitExhausted } from 'src/engine/core-modules/usage-limit/utils/is-limit-exhausted.util';

describe('isLimitExhausted', () => {
  it('admits a cost that fits the cap exactly', () => {
    expect(
      isLimitExhausted({ consumed: 900, cost: 100, limitValue: 1_000 }),
    ).toBe(false);
  });

  it('refuses a cost one unit over the cap', () => {
    expect(
      isLimitExhausted({ consumed: 900, cost: 101, limitValue: 1_000 }),
    ).toBe(true);
  });

  it('refuses at the cap even with no cost', () => {
    expect(
      isLimitExhausted({ consumed: 1_000, cost: 0, limitValue: 1_000 }),
    ).toBe(true);
  });

  it('refuses past the cap', () => {
    expect(
      isLimitExhausted({ consumed: 1_200, cost: 0, limitValue: 1_000 }),
    ).toBe(true);
  });

  it('admits under the cap with no cost', () => {
    expect(
      isLimitExhausted({ consumed: 999, cost: 0, limitValue: 1_000 }),
    ).toBe(false);
  });
});
