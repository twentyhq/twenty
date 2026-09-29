import { ONBOARDING_CREDITS_STEPS } from '@/onboarding/constants/OnboardingCreditsSteps';
import { ONBOARDING_LIVE_CREDITS_STEPS } from '@/onboarding/constants/OnboardingLiveCreditsSteps';
import { ONBOARDING_STATUS_BY_CREDITS_STEP } from '@/onboarding/constants/OnboardingStatusByCreditsStep';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { isOnboardingCreditsStepDone } from '@/onboarding/utils/isOnboardingCreditsStepDone';
import { type OnboardingStatus } from '~/generated-metadata/graphql';

type GetOnboardingCountedFreeCreditsArgs = {
  onboardingFreeCredits: OnboardingFreeCredits;
  onboardingStatus: OnboardingStatus | null | undefined;
};

export const getOnboardingCountedFreeCredits = ({
  onboardingFreeCredits,
  onboardingStatus,
}: GetOnboardingCountedFreeCreditsArgs) =>
  ONBOARDING_CREDITS_STEPS.reduce<OnboardingFreeCredits>(
    (countedFreeCredits, step) =>
      isOnboardingCreditsStepDone({ step, onboardingStatus }) ||
      (ONBOARDING_LIVE_CREDITS_STEPS.includes(step) &&
        ONBOARDING_STATUS_BY_CREDITS_STEP[step] === onboardingStatus)
        ? countedFreeCredits
        : { ...countedFreeCredits, [step]: 0 },
    onboardingFreeCredits,
  );
