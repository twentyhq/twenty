import { type CurrentUser } from '@/auth/states/currentUserState';
import { ONBOARDING_BOOK_CALL_PENDING_USER_VAR_KEY } from '@/onboarding/constants/OnboardingBookCallPendingUserVarKey';

export const getIsBookCallOnboardingStepPending = (
  currentUser: Pick<CurrentUser, 'userVars'> | null,
) =>
  currentUser?.userVars?.[ONBOARDING_BOOK_CALL_PENDING_USER_VAR_KEY] === true;
