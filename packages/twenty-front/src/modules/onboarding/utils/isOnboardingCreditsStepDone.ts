import { ONBOARDING_STATUS_BY_CREDITS_STEP } from '@/onboarding/constants/OnboardingStatusByCreditsStep';
import { ONBOARDING_STATUS_ORDER } from '@/onboarding/constants/OnboardingStatusOrder';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { isDefined } from 'twenty-shared/utils';
import { type OnboardingStatus } from '~/generated-metadata/graphql';

type IsOnboardingCreditsStepDoneArgs = {
  step: OnboardingCreditsStep;
  onboardingStatus: OnboardingStatus | null | undefined;
};

export const isOnboardingCreditsStepDone = ({
  step,
  onboardingStatus,
}: IsOnboardingCreditsStepDoneArgs) => {
  const statusIndex = isDefined(onboardingStatus)
    ? ONBOARDING_STATUS_ORDER.indexOf(onboardingStatus)
    : -1;
  const stepStatusIndex = ONBOARDING_STATUS_ORDER.indexOf(
    ONBOARDING_STATUS_BY_CREDITS_STEP[step],
  );

  return step === 'upgradeTrial'
    ? statusIndex >= stepStatusIndex
    : statusIndex > stepStatusIndex;
};
