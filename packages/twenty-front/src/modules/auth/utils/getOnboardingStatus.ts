import { CurrentUser } from '@/auth/states/currentUserState';
import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
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
  currentWorkspace,
  currentUser,
  isBillingEnabled,
}: {
  isLoggedIn: boolean;
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

  if (currentUser.onboardingStep === OnboardingStep.SubscriptionIncomplete) {
    return OnboardingStatus.Incomplete;
  }

  if (currentUser.onboardingStep === OnboardingStep.WorkspaceActivation) {
    return OnboardingStatus.OngoingWorkspaceActivation;
  }

  if (currentUser.onboardingStep === OnboardingStep.ProfileCreation) {
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
