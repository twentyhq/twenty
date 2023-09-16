import { CurrentUser } from '../states/currentUserState';

export enum OnboardingStatus {
  OngoingUserCreation = 'ongoing_user_creation',
  OngoingWorkspaceCreation = 'ongoing_workspace_creation',
  OngoingProfileCreation = 'ongoing_profile_creation',
  Completed = 'completed',
}

export const getOnboardingStatus = (
  isLoggedIn: boolean,
  currentUser: CurrentUser | null,
) => {
  if (!isLoggedIn) {
    return OnboardingStatus.OngoingUserCreation;
  }

  // if the user has not been fetched yet, we can't know the onboarding status
  if (!currentUser) {
    return undefined;
  }

  if (!currentUser.workspaceMember?.workspace.displayName) {
    return OnboardingStatus.OngoingWorkspaceCreation;
  }
  if (!currentUser.firstName || !currentUser.lastName) {
    return OnboardingStatus.OngoingProfileCreation;
  }

  return OnboardingStatus.Completed;
};
