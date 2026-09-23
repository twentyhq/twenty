import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { ONBOARDING_INSTALLABLE_APPS } from '@/onboarding/constants/OnboardingInstallableApps';
import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { isDefined } from 'twenty-shared/utils';
import {
  type OnboardingCreditRewards,
  OnboardingStatus,
} from '~/generated-metadata/graphql';

const ONBOARDING_STATUS_ORDER = [
  OnboardingStatus.WORKSPACE_ACTIVATION,
  OnboardingStatus.SYNC_EMAIL,
  OnboardingStatus.APPS_INSTALLATION,
  OnboardingStatus.PROFILE_CREATION,
  OnboardingStatus.INVITE_TEAM,
  OnboardingStatus.BOOK_CALL,
  OnboardingStatus.PLAN_REQUIRED,
  OnboardingStatus.COMPLETED,
];

const ONBOARDING_CREDITS_STEP_BY_STATUS: Partial<
  Record<OnboardingStatus, OnboardingCreditsStep>
> = {
  [OnboardingStatus.SYNC_EMAIL]: 'importContacts',
  [OnboardingStatus.APPS_INSTALLATION]: 'installApps',
  [OnboardingStatus.INVITE_TEAM]: 'inviteTeam',
};

type GetOnboardingCreditsProgressArgs = {
  creditRewards: Omit<OnboardingCreditRewards, '__typename'>;
  onboardingConfig: OnboardingConfig;
  onboardingStatus: OnboardingStatus | null | undefined;
  isFirstWorkspaceMember: boolean;
};

export const getOnboardingCreditsProgress = ({
  creditRewards,
  onboardingConfig,
  onboardingStatus,
  isFirstWorkspaceMember,
}: GetOnboardingCreditsProgressArgs): OnboardingCreditsProgress => {
  const {
    importContactsCredits,
    installAppsCredits,
    inviteTeamCredits,
    enrichmentQualificationCredits,
    totalCredits,
    pendingInvitationsCount,
  } = creditRewards;

  const statusIndex = isDefined(onboardingStatus)
    ? ONBOARDING_STATUS_ORDER.indexOf(onboardingStatus)
    : -1;
  const hasReached = (status: OnboardingStatus) =>
    statusIndex >= ONBOARDING_STATUS_ORDER.indexOf(status);

  // Only the first member of a workspace can still earn these two rewards.
  const importContactsGoal = isFirstWorkspaceMember
    ? onboardingConfig.importContactsCreditsReward
    : 0;
  const installAppsGoal = isFirstWorkspaceMember
    ? onboardingConfig.installAppsCreditsRewardPerApp *
      ONBOARDING_INSTALLABLE_APPS.length
    : 0;
  const inviteTeamGoal =
    onboardingConfig.inviteTeamCreditsRewardPerUser *
    onboardingConfig.inviteTeamMaxInvites;

  const pendingCredits = Math.min(
    pendingInvitationsCount * onboardingConfig.inviteTeamCreditsRewardPerUser,
    Math.max(0, inviteTeamGoal - inviteTeamCredits),
  );

  const creditsLeftByStep: Record<OnboardingCreditsStep, number> = {
    importContacts: importContactsCredits > 0 ? 0 : importContactsGoal,
    installApps: installAppsCredits > 0 ? 0 : installAppsGoal,
    inviteTeam: Math.max(
      0,
      inviteTeamGoal - inviteTeamCredits - pendingCredits,
    ),
  };

  const onboardingStep = isDefined(onboardingStatus)
    ? ONBOARDING_CREDITS_STEP_BY_STATUS[onboardingStatus]
    : undefined;
  const currentStep =
    isDefined(onboardingStep) && creditsLeftByStep[onboardingStep] > 0
      ? onboardingStep
      : null;

  // Steps show up once the user reaches them, so the next ones stay hidden.
  const visibleSteps: OnboardingCreditsStep[] = [];

  if (
    (isFirstWorkspaceMember && hasReached(OnboardingStatus.SYNC_EMAIL)) ||
    importContactsCredits > 0
  ) {
    visibleSteps.push('importContacts');
  }

  if (
    (isFirstWorkspaceMember &&
      hasReached(OnboardingStatus.APPS_INSTALLATION)) ||
    installAppsCredits > 0
  ) {
    visibleSteps.push('installApps');
  }

  if (
    !isFirstWorkspaceMember ||
    hasReached(OnboardingStatus.INVITE_TEAM) ||
    inviteTeamCredits > 0 ||
    pendingInvitationsCount > 0
  ) {
    visibleSteps.push('inviteTeam');
  }

  return {
    earnedCredits: totalCredits,
    pendingCredits,
    goalCredits: Math.max(
      importContactsGoal +
        installAppsGoal +
        inviteTeamGoal +
        enrichmentQualificationCredits,
      totalCredits + pendingCredits,
    ),
    currentStep,
    currentStepCredits: isDefined(currentStep)
      ? creditsLeftByStep[currentStep]
      : 0,
    visibleSteps,
  };
};
