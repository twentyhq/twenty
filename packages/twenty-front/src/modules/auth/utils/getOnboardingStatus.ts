import { CurrentUser } from '@/auth/states/currentUserState';
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
  currentUser,
}: {
  isLoggedIn: boolean;
  currentUser: CurrentUser | null;
}) => {
  if (!isLoggedIn) {
    return OnboardingStep.UserCreation;
  }

  // After SignInUp, the user should have a current workspace assigned.
  // If not, it indicates that the data is still being requested.
  if (!currentUser) {
    return undefined;
  }

  return currentUser.onboardingStep;
};
