import { type CurrentUser } from '@/auth/states/currentUserState';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { getIsInviteTeamOnboardingStepPending } from '@/onboarding/utils/getIsInviteTeamOnboardingStepPending';
import { getIsPlanRequired } from '@/onboarding/utils/getIsPlanRequired';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export type GetNextOnboardingStatusArgs = {
  currentUser: CurrentUser | null;
  currentWorkspace: CurrentWorkspace | null;
  isBillingEnabled: boolean;
};

export const getNextOnboardingStatus = ({
  currentUser,
  currentWorkspace,
  isBillingEnabled,
}: GetNextOnboardingStatusArgs) => {
  const isPlanRequired = getIsPlanRequired({
    isBillingEnabled,
    currentWorkspace,
  });

  const statusAfterInviteTeam = isPlanRequired
    ? OnboardingStatus.PLAN_REQUIRED
    : OnboardingStatus.COMPLETED;

  if (currentUser?.onboardingStatus === OnboardingStatus.WORKSPACE_ACTIVATION) {
    return OnboardingStatus.SYNC_EMAIL;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.SYNC_EMAIL) {
    return OnboardingStatus.PROFILE_CREATION;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.PROFILE_CREATION) {
    if (
      getIsInviteTeamOnboardingStepPending(currentUser) &&
      currentWorkspace?.workspaceMembersCount === 1
    ) {
      return OnboardingStatus.INVITE_TEAM;
    }
    return statusAfterInviteTeam;
  }
  if (currentUser?.onboardingStatus === OnboardingStatus.INVITE_TEAM) {
    return statusAfterInviteTeam;
  }
  if (currentUser?.onboardingStatus === OnboardingStatus.PLAN_REQUIRED) {
    return statusAfterInviteTeam;
  }
  return OnboardingStatus.COMPLETED;
};
