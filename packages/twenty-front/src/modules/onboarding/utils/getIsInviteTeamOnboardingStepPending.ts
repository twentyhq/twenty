import { type CurrentUser } from '@/auth/states/currentUserState';
import { ONBOARDING_INVITE_TEAM_PENDING_USER_VAR_KEY } from '@/onboarding/constants/OnboardingInviteTeamPendingUserVarKey';

export const getIsInviteTeamOnboardingStepPending = (
  currentUser: Pick<CurrentUser, 'userVars'> | null,
) =>
  currentUser?.userVars?.[ONBOARDING_INVITE_TEAM_PENDING_USER_VAR_KEY] === true;
