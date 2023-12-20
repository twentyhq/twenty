import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export enum OnboardingStatus {
  Incomplete = 'incomplete',
  Canceled = 'canceled',
  OngoingUserCreation = 'ongoing_user_creation',
  OngoingWorkspaceCreation = 'ongoing_workspace_creation',
  OngoingProfileCreation = 'ongoing_profile_creation',
  Completed = 'completed',
}

export const getOnboardingStatus = ({
  isLoggedIn,
  currentWorkspaceMember,
  currentWorkspace,
  isBillingEnabled,
}: {
  isLoggedIn: boolean;
  currentWorkspaceMember: Omit<
    WorkspaceMember,
    'createdAt' | 'updatedAt' | 'userId'
  > | null;
  currentWorkspace: CurrentWorkspace | null;
  isBillingEnabled?: boolean;
}) => {
  if (!isLoggedIn) {
    return OnboardingStatus.OngoingUserCreation;
  }

  // if the user has not been fetched yet, we can't know the onboarding status
  if (!currentWorkspaceMember) {
    return undefined;
  }

  if (
    isBillingEnabled &&
    currentWorkspace?.subscriptionStatus === 'incomplete'
  ) {
    return OnboardingStatus.Incomplete;
  }

  if (isBillingEnabled && currentWorkspace?.subscriptionStatus === 'canceled') {
    return OnboardingStatus.Canceled;
  }

  if (!currentWorkspace?.displayName) {
    return OnboardingStatus.OngoingWorkspaceCreation;
  }
  if (
    !currentWorkspaceMember.name.firstName ||
    !currentWorkspaceMember.name.lastName
  ) {
    return OnboardingStatus.OngoingProfileCreation;
  }

  return OnboardingStatus.Completed;
};
