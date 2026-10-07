import { ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX } from '@/onboarding/components/OnboardingConstructionSite/buildOnboardingConstructionSiteScene';
import { getOnboardingConstructionSiteStage } from '@/onboarding/components/OnboardingConstructionSite/getOnboardingConstructionSiteStage';
import { OnboardingStatus } from '~/generated-metadata/graphql';

describe('getOnboardingConstructionSiteStage', () => {
  it('should start the site on the first step', () => {
    expect(
      getOnboardingConstructionSiteStage({
        onboardingStatus: OnboardingStatus.SYNC_EMAIL,
        isLastOnboardingStep: false,
      }),
    ).toEqual({ stageIndex: 0 });
  });

  it('should move the construction forward with each step', () => {
    const stageIndexes = [
      OnboardingStatus.SYNC_EMAIL,
      OnboardingStatus.PROFILE_CREATION,
      OnboardingStatus.INVITE_TEAM,
      OnboardingStatus.BOOK_CALL,
    ].map(
      (onboardingStatus) =>
        getOnboardingConstructionSiteStage({
          onboardingStatus,
          isLastOnboardingStep: false,
        }).stageIndex,
    );

    expect(stageIndexes).toEqual([0, 1, 2, 3]);
  });

  it('should keep the site on its first stage before the first step that shows it', () => {
    expect(
      getOnboardingConstructionSiteStage({
        onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION,
        isLastOnboardingStep: false,
      }),
    ).toEqual({ stageIndex: 0 });
    expect(
      getOnboardingConstructionSiteStage({
        onboardingStatus: undefined,
        isLastOnboardingStep: false,
      }),
    ).toEqual({ stageIndex: 0 });
  });

  it('should keep the finale for the last step', () => {
    expect(
      getOnboardingConstructionSiteStage({
        onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
        isLastOnboardingStep: false,
      }).stageIndex,
    ).toBe(ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX - 1);
  });

  it('should complete the site with the finale on the last step', () => {
    expect(
      getOnboardingConstructionSiteStage({
        onboardingStatus: OnboardingStatus.INVITE_TEAM,
        isLastOnboardingStep: true,
      }),
    ).toEqual({ stageIndex: ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX });
  });
});
