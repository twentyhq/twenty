import { type CurrentUser } from '@/auth/states/currentUserState';
import { getIsBookCallOnboardingStepPending } from '@/onboarding/utils/getIsBookCallOnboardingStepPending';

export const getIsBookCallRequired = ({
  isBookCallOnboardingStepEnabled,
  currentUser,
}: {
  isBookCallOnboardingStepEnabled: boolean;
  currentUser: Pick<CurrentUser, 'userVars'> | null;
}) =>
  isBookCallOnboardingStepEnabled &&
  getIsBookCallOnboardingStepPending(currentUser);
