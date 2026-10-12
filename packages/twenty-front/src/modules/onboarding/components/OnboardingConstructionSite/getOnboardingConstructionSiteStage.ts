import { isDefined } from 'twenty-shared/utils';

import { ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX } from '@/onboarding/components/OnboardingConstructionSite/buildOnboardingConstructionSiteScene';
import { type OnboardingConstructionSiteStage } from '@/onboarding/components/OnboardingConstructionSite/OnboardingConstructionSiteStage';
import { ONBOARDING_STATUS_ORDER } from '@/onboarding/constants/OnboardingStatusOrder';
import { OnboardingStatus } from '~/generated-metadata/graphql';

// The site starts on the first step rendered by OnboardingStepLayout, and its
// final stage is kept for the finale, which only the last onboarding step
// reaches, whichever status that is for the workspace.
const FIRST_STAGE_STATUS_INDEX = ONBOARDING_STATUS_ORDER.indexOf(
  OnboardingStatus.SYNC_EMAIL,
);
const LAST_REGULAR_STAGE_INDEX =
  ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX - 1;

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

  const statusIndex = isDefined(onboardingStatus)
    ? ONBOARDING_STATUS_ORDER.indexOf(onboardingStatus)
    : -1;

  return {
    stageIndex: Math.min(
      Math.max(statusIndex - FIRST_STAGE_STATUS_INDEX, 0),
      LAST_REGULAR_STAGE_INDEX,
    ),
  };
};
