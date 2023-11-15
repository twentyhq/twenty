import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

export enum OnboardingStatus {
  OngoingUserCreation = 'ongoing_user_creation',
  OngoingWorkspaceCreation = 'ongoing_workspace_creation',
  OngoingProfileCreation = 'ongoing_profile_creation',
  Completed = 'completed',
}

export const getOnboardingStatus = (
  isLoggedIn: boolean,
  currentWorkspaceMember: CurrentWorkspaceMember | null,
  currentWorkspace: CurrentWorkspace | null,
) => {
  if (!isLoggedIn) {
    return OnboardingStatus.OngoingUserCreation;
  }

  // if the user has not been fetched yet, we can't know the onboarding status
  if (!currentWorkspaceMember) {
    return undefined;
  }

  if (!currentWorkspace?.displayName) {
    return OnboardingStatus.OngoingWorkspaceCreation;
  }
  if (!currentWorkspaceMember.firstName || !currentWorkspaceMember.lastName) {
    return OnboardingStatus.OngoingProfileCreation;
  }

  return OnboardingStatus.Completed;
};
