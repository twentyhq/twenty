import { CurrentUser } from '../states/currentUserState';

export enum OnboardingStatus {
  OngoingUserCreation = 'ongoing_user_creation',
  OngoingWorkspaceCreation = 'ongoing_workspace_creation',
  OngoingProfileCreation = 'ongoing_profile_creation',
  Completed = 'completed',
}

export function getOnboardingStatus(
  isLoggedIn: boolean,
  currentUser: CurrentUser | null,
) {
  if (!isLoggedIn) {
    return OnboardingStatus.OngoingUserCreation;
  }
  if (currentUser && !currentUser.workspaceMember?.workspace.displayName) {
    return OnboardingStatus.OngoingWorkspaceCreation;
  }
  if (currentUser && (!currentUser.firstName || !currentUser.lastName)) {
    return OnboardingStatus.OngoingProfileCreation;
  }

  return OnboardingStatus.Completed;
}
