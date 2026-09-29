import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { ONBOARDING_CREDITS_STEPS } from '@/onboarding/constants/OnboardingCreditsSteps';
import { ONBOARDING_STATUS_BY_CREDITS_STEP } from '@/onboarding/constants/OnboardingStatusByCreditsStep';
import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { getOnboardingCountedFreeCredits } from '@/onboarding/utils/getOnboardingCountedFreeCredits';
import { getOnboardingEarnedCredits } from '@/onboarding/utils/getOnboardingEarnedCredits';
import { getOnboardingRewardCreditsByStep } from '@/onboarding/utils/getOnboardingRewardCreditsByStep';
import { isOnboardingCreditsStepDone } from '@/onboarding/utils/isOnboardingCreditsStepDone';
import { isDefined } from 'twenty-shared/utils';
import { type OnboardingStatus } from '~/generated-metadata/graphql';

type GetOnboardingCreditsProgressArgs = {
  onboardingFreeCredits: OnboardingFreeCredits;
  onboardingConfig: OnboardingConfig;
  onboardingStatus: OnboardingStatus | null | undefined;
  isWorkspaceCreator: boolean;
  isPlanRequired: boolean;
};

export const getOnboardingCreditsProgress = ({
  onboardingFreeCredits,
  onboardingConfig,
  onboardingStatus,
  isWorkspaceCreator,
  isPlanRequired,
}: GetOnboardingCreditsProgressArgs): OnboardingCreditsProgress => {
  const countedFreeCredits = getOnboardingCountedFreeCredits({
    onboardingFreeCredits,
    onboardingStatus,
  });

  const rewardCreditsByStep = getOnboardingRewardCreditsByStep({
    onboardingConfig,
    isWorkspaceCreator,
    isPlanRequired,
  });

  const onboardingStep = ONBOARDING_CREDITS_STEPS.find(
    (step) => ONBOARDING_STATUS_BY_CREDITS_STEP[step] === onboardingStatus,
  );

  const currentStepCredits = isDefined(onboardingStep)
    ? Math.max(
        0,
        rewardCreditsByStep[onboardingStep] -
          countedFreeCredits[onboardingStep],
      )
    : 0;

  const goalCredits = ONBOARDING_CREDITS_STEPS.reduce(
    (goal, step) =>
      goal +
      (isOnboardingCreditsStepDone({ step, onboardingStatus }) &&
      step !== 'inviteTeam'
        ? Math.max(rewardCreditsByStep[step], countedFreeCredits[step])
        : countedFreeCredits[step]),
    0,
  );

  return {
    earnedCredits: getOnboardingEarnedCredits(countedFreeCredits),
    earnedCreditsByStep: ONBOARDING_CREDITS_STEPS.filter(
      (step) =>
        countedFreeCredits[step] > 0 ||
        (isOnboardingCreditsStepDone({ step, onboardingStatus }) &&
          rewardCreditsByStep[step] > 0),
    ).map((step) => ({
      step,
      credits: countedFreeCredits[step],
      rewardCredits: rewardCreditsByStep[step],
    })),
    goalCredits,
    currentStep:
      isDefined(onboardingStep) && currentStepCredits > 0
        ? onboardingStep
        : null,
    currentStepCredits,
  };
};
