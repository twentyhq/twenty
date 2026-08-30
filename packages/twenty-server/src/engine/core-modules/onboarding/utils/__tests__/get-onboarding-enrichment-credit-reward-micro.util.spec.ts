import { getOnboardingEnrichmentCreditRewardMicro } from 'src/engine/core-modules/onboarding/utils/get-onboarding-enrichment-credit-reward-micro.util';

describe('getOnboardingEnrichmentCreditRewardMicro', () => {
  const tiers = {
    midMarket: { minEmployeeCount: 20, amountMicro: 5_000_000 },
    enterprise: { minEmployeeCount: 200, amountMicro: 10_000_000 },
  };

  it('pays the tier an enriched company lands in', () => {
    expect(
      getOnboardingEnrichmentCreditRewardMicro({ employeeCount: 20, tiers }),
    ).toBe(5_000_000);
  });

  it('pays the most generous tier a company clears', () => {
    expect(
      getOnboardingEnrichmentCreditRewardMicro({ employeeCount: 5000, tiers }),
    ).toBe(10_000_000);
  });

  it('pays nothing below every tier', () => {
    expect(
      getOnboardingEnrichmentCreditRewardMicro({ employeeCount: 19, tiers }),
    ).toBeNull();
  });

  it('pays nothing when enrichment returned no employee count', () => {
    expect(
      getOnboardingEnrichmentCreditRewardMicro({ employeeCount: null, tiers }),
    ).toBeNull();
  });

  it('pays nothing while no tier is configured', () => {
    expect(
      getOnboardingEnrichmentCreditRewardMicro({
        employeeCount: 5000,
        tiers: {},
      }),
    ).toBeNull();
    expect(
      getOnboardingEnrichmentCreditRewardMicro({
        employeeCount: 5000,
        tiers: undefined,
      }),
    ).toBeNull();
  });

  it('pays every matched company when a tier asks for no minimum', () => {
    expect(
      getOnboardingEnrichmentCreditRewardMicro({
        employeeCount: 1,
        tiers: { anyCompany: { minEmployeeCount: 0, amountMicro: 5_000_000 } },
      }),
    ).toBe(5_000_000);
  });

  it('drops malformed tiers instead of reading them as a zero threshold', () => {
    expect(
      getOnboardingEnrichmentCreditRewardMicro({
        employeeCount: 5000,
        tiers: {
          wordThreshold: { minEmployeeCount: 'twenty', amountMicro: 9_000_000 },
          zeroAmount: { minEmployeeCount: 20, amountMicro: 0 },
          missingThreshold: { amountMicro: 8_000_000 },
          missingAmount: { minEmployeeCount: 20 },
        } as never,
      }),
    ).toBeNull();
  });
});
