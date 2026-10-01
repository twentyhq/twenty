import { type CurrentUser } from '@/auth/states/currentUserState';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { getIsPlanRequired } from '@/onboarding/utils/getIsPlanRequired';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export type GetNextOnboardingStatusArgs = {
  currentUser: CurrentUser | null;
  currentWorkspace: CurrentWorkspace | null;
  isBillingEnabled: boolean;
  isBookCallRequired: boolean;
};

export const getNextOnboardingStatus = ({
  currentUser,
  currentWorkspace,
  isBillingEnabled,
  isBookCallRequired,
}: GetNextOnboardingStatusArgs) => {
  const isPlanRequired = getIsPlanRequired({
    isBillingEnabled,
    currentWorkspace,
  });

  const statusAfterBookCall = isPlanRequired
    ? OnboardingStatus.PLAN_REQUIRED
    : OnboardingStatus.COMPLETED;

  const statusAfterInviteTeam =
    isBookCallRequired && isPlanRequired
      ? OnboardingStatus.BOOK_CALL
      : statusAfterBookCall;

  if (currentUser?.onboardingStatus === OnboardingStatus.WORKSPACE_ACTIVATION) {
    return OnboardingStatus.SYNC_EMAIL;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.SYNC_EMAIL) {
    if (currentWorkspace?.workspaceMembersCount === 1) {
      return OnboardingStatus.APPS_INSTALLATION;
    }
    return OnboardingStatus.PROFILE_CREATION;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.APPS_INSTALLATION) {
    return OnboardingStatus.PROFILE_CREATION;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.PROFILE_CREATION) {
    if (currentWorkspace?.workspaceMembersCount === 1) {
      return OnboardingStatus.INVITE_TEAM;
    }
    return statusAfterInviteTeam;
  }
  if (currentUser?.onboardingStatus === OnboardingStatus.INVITE_TEAM) {
    return statusAfterInviteTeam;
  }
  if (
    currentUser?.onboardingStatus === OnboardingStatus.BOOK_CALL ||
    currentUser?.onboardingStatus === OnboardingStatus.PLAN_REQUIRED
  ) {
    return statusAfterBookCall;
  }
  return OnboardingStatus.COMPLETED;
};
