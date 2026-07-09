import { shouldShowWelcomeAnimationOnNavigate } from '@/onboarding/utils/shouldShowWelcomeAnimationOnNavigate';
import { OnboardingStatus } from '~/generated-metadata/graphql';

describe('shouldShowWelcomeAnimationOnNavigate', () => {
  it('should return true when leaving an onboarding page for the workspace after completion', () => {
    expect(
      shouldShowWelcomeAnimationOnNavigate({
        onboardingStatus: OnboardingStatus.COMPLETED,
        isOnOnboardingPage: true,
        isNavigatingToOnboardingOrAuthPath: false,
      }),
    ).toBe(true);
  });

  it('should return false when onboarding is not yet completed', () => {
    expect(
      shouldShowWelcomeAnimationOnNavigate({
        onboardingStatus: OnboardingStatus.INVITE_TEAM,
        isOnOnboardingPage: true,
        isNavigatingToOnboardingOrAuthPath: false,
      }),
    ).toBe(false);
  });

  it('should return false when navigating to another onboarding or auth path', () => {
    expect(
      shouldShowWelcomeAnimationOnNavigate({
        onboardingStatus: OnboardingStatus.COMPLETED,
        isOnOnboardingPage: true,
        isNavigatingToOnboardingOrAuthPath: true,
      }),
    ).toBe(false);
  });

  it('should return false when the current page is not an onboarding page', () => {
    expect(
      shouldShowWelcomeAnimationOnNavigate({
        onboardingStatus: OnboardingStatus.COMPLETED,
        isOnOnboardingPage: false,
        isNavigatingToOnboardingOrAuthPath: false,
      }),
    ).toBe(false);
  });

  it('should return false when the onboarding status is undefined', () => {
    expect(
      shouldShowWelcomeAnimationOnNavigate({
        onboardingStatus: undefined,
        isOnOnboardingPage: true,
        isNavigatingToOnboardingOrAuthPath: false,
      }),
    ).toBe(false);
  });
});
