import { clampUserCreditsUsedMicro } from 'src/engine/core-modules/usage/utils/clamp-user-credits-used-micro.util';

describe('clampUserCreditsUsedMicro', () => {
  it('should keep a share below the total', () => {
    expect(
      clampUserCreditsUsedMicro({
        userCreditsUsedMicro: 2_500,
        creditsUsedMicro: 10_000,
      }),
    ).toBe(2_500);
  });

  it('should lower a share above the total to the total', () => {
    expect(
      clampUserCreditsUsedMicro({
        userCreditsUsedMicro: 10_001,
        creditsUsedMicro: 10_000,
      }),
    ).toBe(10_000);
  });

  it('should record a negative share as 0', () => {
    expect(
      clampUserCreditsUsedMicro({
        userCreditsUsedMicro: -1,
        creditsUsedMicro: 10_000,
      }),
    ).toBe(0);
  });
});
