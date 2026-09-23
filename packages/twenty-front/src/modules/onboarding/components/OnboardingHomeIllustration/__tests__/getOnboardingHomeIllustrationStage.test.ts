import { getOnboardingHomeIllustrationStage } from '@/onboarding/components/OnboardingHomeIllustration/getOnboardingHomeIllustrationStage';
import { ONBOARDING_HOME_ILLUSTRATION_FURNITURE } from '@/onboarding/components/OnboardingHomeIllustration/onboardingHomeIllustrationFurniture';
import { OnboardingStatus } from '~/generated-metadata/graphql';

describe('getOnboardingHomeIllustrationStage', () => {
  it('should show an empty room on the first step', () => {
    expect(
      getOnboardingHomeIllustrationStage({
        onboardingStatus: OnboardingStatus.SYNC_EMAIL,
        isLastOnboardingStep: false,
      }),
    ).toEqual({ revealedFurnitureCount: 0, isFinale: false });
  });

  it('should move one more piece of furniture in with each completed step', () => {
    const revealedFurnitureCounts = [
      OnboardingStatus.SYNC_EMAIL,
      OnboardingStatus.APPS_INSTALLATION,
      OnboardingStatus.PROFILE_CREATION,
      OnboardingStatus.INVITE_TEAM,
    ].map(
      (onboardingStatus) =>
        getOnboardingHomeIllustrationStage({
          onboardingStatus,
          isLastOnboardingStep: false,
        }).revealedFurnitureCount,
    );

    expect(revealedFurnitureCounts).toEqual([0, 1, 2, 3]);
  });

  it('should reveal the whole room with the finale on the last step', () => {
    expect(
      getOnboardingHomeIllustrationStage({
        onboardingStatus: OnboardingStatus.PROFILE_CREATION,
        isLastOnboardingStep: true,
      }),
    ).toEqual({
      revealedFurnitureCount: ONBOARDING_HOME_ILLUSTRATION_FURNITURE.length,
      isFinale: true,
    });
  });

  it('should never reveal more furniture than the room has', () => {
    expect(
      getOnboardingHomeIllustrationStage({
        onboardingStatus: OnboardingStatus.BOOK_CALL,
        isLastOnboardingStep: false,
      }).revealedFurnitureCount,
    ).toBeLessThanOrEqual(ONBOARDING_HOME_ILLUSTRATION_FURNITURE.length);
  });
});
