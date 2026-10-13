import { clampMemberCreditsUsedMicro } from 'src/engine/core-modules/usage/utils/clamp-member-credits-used-micro.util';

describe('clampMemberCreditsUsedMicro', () => {
  it('should keep a share below the total', () => {
    expect(
      clampMemberCreditsUsedMicro({
        memberCreditsUsedMicro: 2_500,
        creditsUsedMicro: 10_000,
      }),
    ).toBe(2_500);
  });

  it('should lower a share above the total to the total', () => {
    expect(
      clampMemberCreditsUsedMicro({
        memberCreditsUsedMicro: 10_001,
        creditsUsedMicro: 10_000,
      }),
    ).toBe(10_000);
  });

  it('should record a negative share as 0', () => {
    expect(
      clampMemberCreditsUsedMicro({
        memberCreditsUsedMicro: -1,
        creditsUsedMicro: 10_000,
      }),
    ).toBe(0);
  });
});
