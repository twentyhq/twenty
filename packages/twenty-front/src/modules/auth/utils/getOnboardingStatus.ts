import { CurrentUser } from '@/auth/states/currentUserState';
import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { OnboardingStep } from '~/generated/graphql';

export enum OnboardingStatus {
  Incomplete = 'incomplete',
  Canceled = 'canceled',
  Unpaid = 'unpaid',
  PastDue = 'past_due',
  OngoingUserCreation = 'ongoing_user_creation',
  OngoingWorkspaceActivation = 'ongoing_workspace_activation',
  OngoingProfileCreation = 'ongoing_profile_creation',
  OngoingSyncEmail = 'ongoing_sync_email',
  OngoingInviteTeam = 'ongoing_invite_team',
  Completed = 'completed',
  CompletedWithoutSubscription = 'completed_without_subscription',
}

export const getOnboardingStatus = ({
  isLoggedIn,
  currentWorkspaceMember,
  currentWorkspace,
  currentUser,
  isBillingEnabled,
}: {
  isLoggedIn: boolean;
  currentWorkspaceMember: Omit<
    WorkspaceMember,
    'createdAt' | 'updatedAt' | 'userId' | 'userEmail' | '__typename'
  > | null;
  currentWorkspace: CurrentWorkspace | null;
  currentUser: CurrentUser | null;
  isBillingEnabled: boolean;
}) => {
  if (!isLoggedIn) {
    return OnboardingStatus.OngoingUserCreation;
  }

  // After SignInUp, the user should have a current workspace assigned.
  // If not, it indicates that the data is still being requested.
  if (!currentWorkspace || !currentUser) {
    return undefined;
  }

  if (
    isBillingEnabled &&
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

  if (currentUser.onboardingStep === OnboardingStep.SyncEmail) {
    return OnboardingStatus.OngoingSyncEmail;
  }

  if (currentUser.onboardingStep === OnboardingStep.InviteTeam) {
    return OnboardingStatus.OngoingInviteTeam;
  }

  if (isBillingEnabled && currentWorkspace.subscriptionStatus === 'canceled') {
    return OnboardingStatus.Canceled;
  }

  if (isBillingEnabled && currentWorkspace.subscriptionStatus === 'past_due') {
    return OnboardingStatus.PastDue;
  }

  if (isBillingEnabled && currentWorkspace.subscriptionStatus === 'unpaid') {
    return OnboardingStatus.Unpaid;
  }

  if (isBillingEnabled && !currentWorkspace.currentBillingSubscription) {
    return OnboardingStatus.CompletedWithoutSubscription;
  }

  return OnboardingStatus.Completed;
};
