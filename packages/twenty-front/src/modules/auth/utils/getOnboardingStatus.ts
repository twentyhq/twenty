import { CurrentUser } from '@/auth/states/currentUserState';
import { OnboardingStatus } from '~/generated/graphql';

export const getOnboardingStatus = ({
  isLoggedIn,
  currentUser,
}: {
  isLoggedIn: boolean;
  currentUser: CurrentUser | null;
}) => {
  if (!isLoggedIn) {
    return OnboardingStatus.UserCreation;
  }

  // After SignInUp, the user should have a current workspace assigned.
  // If not, it indicates that the data is still being requested.
  if (!currentUser) {
    return undefined;
  }

  return currentUser.onboardingStatus;
};
