import { getOnboardingCreditsRewardAriaLabel } from '@/onboarding/utils/getOnboardingCreditsRewardAriaLabel';

describe('getOnboardingCreditsRewardAriaLabel', () => {
  it('should name the reward after the action', () => {
    expect(
      getOnboardingCreditsRewardAriaLabel({
        label: 'Continue with Google',
        creditsReward: 1,
        formattedCreditsReward: '1',
      }),
    ).toBe('Continue with Google, earn 1 free credit');
  });

  it('should use the plural for fractional rewards', () => {
    expect(
      getOnboardingCreditsRewardAriaLabel({
        label: 'Install all 2 apps',
        creditsReward: 0.5,
        formattedCreditsReward: '0.5',
      }),
    ).toBe('Install all 2 apps, earn 0.5 free credits');
  });

  it('should announce the amount as it is displayed', () => {
    expect(
      getOnboardingCreditsRewardAriaLabel({
        label: 'Continue with Google',
        creditsReward: 2.5,
        formattedCreditsReward: '2,5',
      }),
    ).toBe('Continue with Google, earn 2,5 free credits');
  });

  it('should say when the reward is per item', () => {
    expect(
      getOnboardingCreditsRewardAriaLabel({
        label: 'Invite',
        creditsReward: 0.5,
        formattedCreditsReward: '0.5',
        isRewardPerItem: true,
      }),
    ).toBe('Invite, earn 0.5 free credits each');
  });

  it('should leave the label alone without a reward', () => {
    expect(
      getOnboardingCreditsRewardAriaLabel({
        label: 'Continue',
        creditsReward: 0,
        formattedCreditsReward: '0',
      }),
    ).toBeUndefined();
  });
});
