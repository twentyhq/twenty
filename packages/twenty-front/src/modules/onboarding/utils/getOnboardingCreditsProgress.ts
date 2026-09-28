import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { ONBOARDING_CREDITS_STEPS } from '@/onboarding/constants/OnboardingCreditsSteps';
import { ONBOARDING_STATUS_BY_CREDITS_STEP } from '@/onboarding/constants/OnboardingStatusByCreditsStep';
import { ONBOARDING_STATUS_ORDER } from '@/onboarding/constants/OnboardingStatusOrder';
import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { getOnboardingEarnedCredits } from '@/onboarding/utils/getOnboardingEarnedCredits';
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
  const statusIndex = isDefined(onboardingStatus)
    ? ONBOARDING_STATUS_ORDER.indexOf(onboardingStatus)
    : -1;

  const isStepDone = (step: OnboardingCreditsStep) => {
    const stepStatusIndex = ONBOARDING_STATUS_ORDER.indexOf(
      ONBOARDING_STATUS_BY_CREDITS_STEP[step],
    );

    return step === 'upgradeTrial'
      ? statusIndex >= stepStatusIndex
      : statusIndex > stepStatusIndex;
  };

  const rewardCreditsByStep: Record<OnboardingCreditsStep, number> = {
    importContacts: isWorkspaceCreator
      ? onboardingConfig.importContactsCreditsReward
      : 0,
    installApps: isWorkspaceCreator
      ? onboardingConfig.installAppsCreditsReward
      : 0,
    createProfile: isWorkspaceCreator
      ? onboardingConfig.createProfileCreditsReward
      : 0,
    inviteTeam:
      onboardingConfig.inviteTeamCreditsRewardPerUser *
      onboardingConfig.inviteTeamMaxInvites,
    upgradeTrial: isPlanRequired ? onboardingConfig.upgradeCreditsReward : 0,
  };

  const onboardingStep = ONBOARDING_CREDITS_STEPS.find(
    (step) => ONBOARDING_STATUS_BY_CREDITS_STEP[step] === onboardingStatus,
  );

  const currentStepCredits = isDefined(onboardingStep)
    ? Math.max(
        0,
        rewardCreditsByStep[onboardingStep] -
          onboardingFreeCredits[onboardingStep],
      )
    : 0;

  const goalCredits = ONBOARDING_CREDITS_STEPS.reduce(
    (goal, step) =>
      goal +
      (isStepDone(step) && step !== 'inviteTeam'
        ? rewardCreditsByStep[step]
        : onboardingFreeCredits[step]),
    0,
  );

  return {
    earnedCredits: getOnboardingEarnedCredits(onboardingFreeCredits),
    goalCredits,
    currentStep:
      isDefined(onboardingStep) && currentStepCredits > 0
        ? onboardingStep
        : null,
    currentStepCredits,
  };
};
