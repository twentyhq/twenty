import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export enum OnboardingStatus {
  Incomplete = 'incomplete',
  Canceled = 'canceled',
  Unpaid = 'unpaid',
  PastDue = 'past_due',
  OngoingUserCreation = 'ongoing_user_creation',
  OngoingWorkspaceActivation = 'ongoing_workspace_activation',
  OngoingProfileCreation = 'ongoing_profile_creation',
  Completed = 'completed',
  CompletedWithoutSubscription = 'completed_without_subscription',
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
    'createdAt' | 'updatedAt' | 'userId' | 'userEmail'
  > | null;
  currentWorkspace: CurrentWorkspace | null;
  isBillingEnabled?: boolean;
}) => {
  if (!isLoggedIn) {
    return OnboardingStatus.OngoingUserCreation;
  }

  // After SignInUp, the user should have a current workspace assigned.
  // If not, it indicates that the data is still being requested.
  if (!currentWorkspace) {
    return undefined;
  }

  if (
    isBillingEnabled === true &&
    currentWorkspace.subscriptionStatus === 'incomplete'
  ) {
    return OnboardingStatus.Incomplete;
  }

  if (currentWorkspace.activationStatus !== 'active') {
    return OnboardingStatus.OngoingWorkspaceActivation;
  }

  if (
    !currentWorkspaceMember?.name.firstName ||
    !currentWorkspaceMember?.name.lastName
  ) {
    return OnboardingStatus.OngoingProfileCreation;
  }

  if (
    isBillingEnabled === true &&
    currentWorkspace.subscriptionStatus === 'canceled'
  ) {
    return OnboardingStatus.Canceled;
  }

  if (
    isBillingEnabled === true &&
    currentWorkspace.subscriptionStatus === 'past_due'
  ) {
    return OnboardingStatus.PastDue;
  }

  if (
    isBillingEnabled === true &&
    currentWorkspace.subscriptionStatus === 'unpaid'
  ) {
    return OnboardingStatus.Unpaid;
  }

  if (
    isBillingEnabled === true &&
    !currentWorkspace.currentBillingSubscription
  ) {
    return OnboardingStatus.CompletedWithoutSubscription;
  }

  return OnboardingStatus.Completed;
};
