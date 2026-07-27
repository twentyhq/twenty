import { getHasJustCompletedOnboarding } from '@/onboarding/utils/getHasJustCompletedOnboarding';
import { OnboardingStatus } from '~/generated-metadata/graphql';

describe('getHasJustCompletedOnboarding', () => {
  it('should return true when the last onboarding step is completed', () => {
    expect(
      getHasJustCompletedOnboarding({
        previousOnboardingStatus: OnboardingStatus.INVITE_TEAM,
        nextOnboardingStatus: OnboardingStatus.COMPLETED,
      }),
    ).toBe(true);
  });

  it('should return true when the profile creation step completes the onboarding', () => {
    expect(
      getHasJustCompletedOnboarding({
        previousOnboardingStatus: OnboardingStatus.PROFILE_CREATION,
        nextOnboardingStatus: OnboardingStatus.COMPLETED,
      }),
    ).toBe(true);
  });

  it('should return false when an intermediate onboarding step is completed', () => {
    expect(
      getHasJustCompletedOnboarding({
        previousOnboardingStatus: OnboardingStatus.SYNC_EMAIL,
        nextOnboardingStatus: OnboardingStatus.APPS_INSTALLATION,
      }),
    ).toBe(false);
  });

  it('should return false when the onboarding was already completed', () => {
    expect(
      getHasJustCompletedOnboarding({
        previousOnboardingStatus: OnboardingStatus.COMPLETED,
        nextOnboardingStatus: OnboardingStatus.COMPLETED,
      }),
    ).toBe(false);
  });

  it('should return false when the previous onboarding status is undefined', () => {
    expect(
      getHasJustCompletedOnboarding({
        previousOnboardingStatus: undefined,
        nextOnboardingStatus: OnboardingStatus.COMPLETED,
      }),
    ).toBe(false);
  });

  it('should return false when the previous onboarding status is null', () => {
    expect(
      getHasJustCompletedOnboarding({
        previousOnboardingStatus: null,
        nextOnboardingStatus: OnboardingStatus.COMPLETED,
      }),
    ).toBe(false);
  });
});
