import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { ONBOARDING_CREDITS_STEPS } from '@/onboarding/constants/OnboardingCreditsSteps';
import { ONBOARDING_STATUS_BY_CREDITS_STEP } from '@/onboarding/constants/OnboardingStatusByCreditsStep';
import { ONBOARDING_STATUS_ORDER } from '@/onboarding/constants/OnboardingStatusOrder';
import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { getInviteTeamCreditsReward } from '@/onboarding/utils/getInviteTeamCreditsReward';
import { isNonEmptyString } from '@sniptt/guards';
import { type FullNameMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type OnboardingStatus } from '~/generated-metadata/graphql';

type GetOnboardingCreditsProgressArgs = {
  onboardingFreeCredits: OnboardingFreeCredits;
  onboardingConfig: OnboardingConfig;
  onboardingStatus: OnboardingStatus | null | undefined;
  isWorkspaceCreator: boolean;
  isPlanRequired: boolean;
  profileName: FullNameMetadata | null | undefined;
  inviteTeamValidEmailsCount: number;
  upgradeTrialLostCredits?: number;
};

export const getOnboardingCreditsProgress = ({
  onboardingFreeCredits,
  onboardingConfig,
  onboardingStatus,
  isWorkspaceCreator,
  isPlanRequired,
  profileName,
  inviteTeamValidEmailsCount,
  upgradeTrialLostCredits = 0,
}: GetOnboardingCreditsProgressArgs): OnboardingCreditsProgress => {
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

  const onboardingStep = ONBOARDING_CREDITS_STEPS.find(
    (step) => ONBOARDING_STATUS_BY_CREDITS_STEP[step] === onboardingStatus,
  );

  const hasProfileName =
    isNonEmptyString(profileName?.firstName) &&
    isNonEmptyString(profileName?.lastName);

  const getCountedCredits = (step: OnboardingCreditsStep) => {
    if (isStepDone(step)) {
      return onboardingFreeCredits[step];
    }

    if (step !== onboardingStep) {
      return 0;
    }

    if (step === 'installApps') {
      return onboardingFreeCredits.installApps;
    }

    if (step === 'createProfile' && hasProfileName) {
      return rewardCreditsByStep.createProfile;
    }

    return 0;
  };

  const earnedCredits = ONBOARDING_CREDITS_STEPS.reduce(
    (total, step) => total + getCountedCredits(step),
    0,
  );

  const currentStepCredits = isDefined(onboardingStep)
    ? Math.max(
        0,
        rewardCreditsByStep[onboardingStep] - getCountedCredits(onboardingStep),
      )
    : 0;

  const goalCredits = ONBOARDING_CREDITS_STEPS.reduce(
    (goal, step) =>
      goal +
      (isStepDone(step) && step !== 'inviteTeam'
        ? Math.max(rewardCreditsByStep[step], getCountedCredits(step))
        : getCountedCredits(step)),
    0,
  );

  const { seenCredits } = onboardingFreeCredits;
  const newlyEarnedCredits = earnedCredits - seenCredits;

  const inviteTeamButtonReward =
    inviteTeamValidEmailsCount > 0
      ? {
          creditsReward: getInviteTeamCreditsReward({
            invitedTeammatesCount: inviteTeamValidEmailsCount,
            onboardingConfig,
          }),
          isRewardPerItem: false,
        }
      : {
          creditsReward: onboardingConfig.inviteTeamCreditsRewardPerUser,
          isRewardPerItem: true,
        };

  return {
    rewardCreditsByStep,
    earnedCredits,
    earnedCreditsByStep: ONBOARDING_CREDITS_STEPS.filter(
      (step) =>
        getCountedCredits(step) > 0 ||
        (isStepDone(step) && rewardCreditsByStep[step] > 0),
    ).map((step) => ({
      step,
      credits: getCountedCredits(step),
      rewardCredits: rewardCreditsByStep[step],
    })),
    goalCredits,
    currentStep:
      isDefined(onboardingStep) && currentStepCredits > 0
        ? onboardingStep
        : null,
    currentStepCredits,
    seenCredits,
    newlyEarnedCredits,
    lostCredits: newlyEarnedCredits > 0 ? 0 : upgradeTrialLostCredits,
    isFirstCreditsGain: seenCredits === 0,
    inviteTeamButtonReward,
  };
};
