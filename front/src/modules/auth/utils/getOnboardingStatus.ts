import { CurrentUser } from '../states/currentUserState';

export enum OnboardingStatus {
  Ongoing = 'ongoing',
  Completed = 'completed',
}

export function getOnboardingStatus(currentUser: CurrentUser | null) {
  if (
    !currentUser ||
    !currentUser.firstName ||
    !currentUser.lastName ||
    !currentUser.workspaceMember?.workspace.displayName
  ) {
    return OnboardingStatus.Ongoing;
  }

  return OnboardingStatus.Completed;
}
