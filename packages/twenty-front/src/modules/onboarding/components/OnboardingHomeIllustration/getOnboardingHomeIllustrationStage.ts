import { isDefined } from 'twenty-shared/utils';

import { ONBOARDING_HOME_ILLUSTRATION_FURNITURE } from '@/onboarding/components/OnboardingHomeIllustration/onboardingHomeIllustrationFurniture';
import { type OnboardingHomeIllustrationStage } from '@/onboarding/components/OnboardingHomeIllustration/onboardingHomeIllustrationStage.type';
import { OnboardingStatus } from '~/generated-metadata/graphql';

const REVEALED_FURNITURE_COUNT_BY_ONBOARDING_STATUS: Partial<
  Record<OnboardingStatus, number>
> = {
  [OnboardingStatus.APPS_INSTALLATION]: 1,
  [OnboardingStatus.PROFILE_CREATION]: 2,
  [OnboardingStatus.INVITE_TEAM]: 3,
  [OnboardingStatus.BOOK_CALL]: 4,
  [OnboardingStatus.PLAN_REQUIRED]: 4,
};

type GetOnboardingHomeIllustrationStageArgs = {
  onboardingStatus: OnboardingStatus | null | undefined;
  isLastOnboardingStep: boolean;
};

export const getOnboardingHomeIllustrationStage = ({
  onboardingStatus,
  isLastOnboardingStep,
}: GetOnboardingHomeIllustrationStageArgs): OnboardingHomeIllustrationStage => {
  const furnitureCount = ONBOARDING_HOME_ILLUSTRATION_FURNITURE.length;

  if (isLastOnboardingStep) {
    return { revealedFurnitureCount: furnitureCount, isFinale: true };
  }

  const revealedFurnitureCount = isDefined(onboardingStatus)
    ? (REVEALED_FURNITURE_COUNT_BY_ONBOARDING_STATUS[onboardingStatus] ?? 0)
    : 0;

  return {
    revealedFurnitureCount: Math.min(revealedFurnitureCount, furnitureCount),
    isFinale: false,
  };
};
