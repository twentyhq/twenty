import { ONBOARDING_CREDITS_STEPS } from '@/onboarding/constants/OnboardingCreditsSteps';
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
      isOnboardingCreditsStepDone({ step, onboardingStatus })
        ? countedFreeCredits
        : { ...countedFreeCredits, [step]: 0 },
    onboardingFreeCredits,
  );
