import { isDefined } from 'twenty-shared/utils';

import { ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX } from '@/onboarding/components/OnboardingConstructionSite/buildOnboardingConstructionSiteScene';
import { type OnboardingConstructionSiteStage } from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteStage.type';
import { OnboardingStatus } from '~/generated-metadata/graphql';

const STAGE_INDEX_BY_ONBOARDING_STATUS: Partial<
  Record<OnboardingStatus, number>
> = {
  [OnboardingStatus.SYNC_EMAIL]: 0,
  [OnboardingStatus.APPS_INSTALLATION]: 1,
  [OnboardingStatus.PROFILE_CREATION]: 2,
  [OnboardingStatus.INVITE_TEAM]: 3,
  [OnboardingStatus.BOOK_CALL]: 4,
  [OnboardingStatus.PLAN_REQUIRED]: 4,
};

type GetOnboardingConstructionSiteStageArgs = {
  onboardingStatus: OnboardingStatus | null | undefined;
  isLastOnboardingStep: boolean;
};

export const getOnboardingConstructionSiteStage = ({
  onboardingStatus,
  isLastOnboardingStep,
}: GetOnboardingConstructionSiteStageArgs): OnboardingConstructionSiteStage => {
  if (isLastOnboardingStep) {
    return { stageIndex: ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX };
  }

  return {
    stageIndex: isDefined(onboardingStatus)
      ? (STAGE_INDEX_BY_ONBOARDING_STATUS[onboardingStatus] ?? 0)
      : 0,
  };
};
