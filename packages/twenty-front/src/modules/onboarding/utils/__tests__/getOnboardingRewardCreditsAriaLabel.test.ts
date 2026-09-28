import { getOnboardingRewardCreditsAriaLabel } from '@/onboarding/utils/getOnboardingRewardCreditsAriaLabel';

describe('getOnboardingRewardCreditsAriaLabel', () => {
  it('should name the reward after the action', () => {
    expect(
      getOnboardingRewardCreditsAriaLabel({
        label: 'Continue with Google',
        rewardCredits: 1,
      }),
    ).toBe('Continue with Google, earn 1 free credit');
  });

  it('should use the plural for fractional rewards', () => {
    expect(
      getOnboardingRewardCreditsAriaLabel({
        label: 'Install all 2 apps',
        rewardCredits: 0.5,
      }),
    ).toBe('Install all 2 apps, earn 0.5 free credits');
  });

  it('should leave the label alone without a reward', () => {
    expect(
      getOnboardingRewardCreditsAriaLabel({
        label: 'Continue',
        rewardCredits: 0,
      }),
    ).toBeUndefined();
  });
});
