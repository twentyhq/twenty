import { type CurrentUser } from '@/auth/states/currentUserState';
import { ONBOARDING_BOOK_CALL_PENDING_USER_VAR_KEY } from '@/onboarding/constants/OnboardingBookCallPendingUserVarKey';
import { isDefined } from 'twenty-shared/utils';

export const setIsBookCallOnboardingStepPending = (
  currentUser: CurrentUser | null,
  isBookCallOnboardingStepPending: boolean,
): CurrentUser | null => {
  if (!isDefined(currentUser)) {
    return currentUser;
  }

  return {
    ...currentUser,
    userVars: {
      ...currentUser.userVars,
      [ONBOARDING_BOOK_CALL_PENDING_USER_VAR_KEY]:
        isBookCallOnboardingStepPending,
    },
  };
};
