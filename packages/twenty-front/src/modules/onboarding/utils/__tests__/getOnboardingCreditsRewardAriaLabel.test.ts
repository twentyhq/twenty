import { getOnboardingCreditsRewardAriaLabel } from '@/onboarding/utils/getOnboardingCreditsRewardAriaLabel';

describe('getOnboardingCreditsRewardAriaLabel', () => {
  it('should name the reward after the action', () => {
    expect(
      getOnboardingCreditsRewardAriaLabel({
        label: 'Continue with Google',
        creditsReward: 1,
      }),
    ).toBe('Continue with Google, earn 1 free credit');
  });

  it('should use the plural for fractional rewards', () => {
    expect(
      getOnboardingCreditsRewardAriaLabel({
        label: 'Install all 2 apps',
        creditsReward: 0.5,
      }),
    ).toBe('Install all 2 apps, earn 0.5 free credits');
  });

  it('should leave the label alone without a reward', () => {
    expect(
      getOnboardingCreditsRewardAriaLabel({
        label: 'Continue',
        creditsReward: 0,
      }),
    ).toBeUndefined();
  });
});
