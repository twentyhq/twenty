import { type CurrentUser } from '@/auth/states/currentUserState';
import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { isNonEmptyString } from '@sniptt/guards';

type GetCreateProfileCreditsRewardArgs = {
  currentUser: CurrentUser | null;
  currentWorkspaceMember: CurrentWorkspaceMember | null;
  onboardingConfig: OnboardingConfig | null;
};

export const getCreateProfileCreditsReward = ({
  currentUser,
  currentWorkspaceMember,
  onboardingConfig,
}: GetCreateProfileCreditsRewardArgs) => {
  const hasSavedName =
    isNonEmptyString(currentWorkspaceMember?.name?.firstName) &&
    isNonEmptyString(currentWorkspaceMember?.name?.lastName);

  return hasSavedName && currentUser?.isWorkspaceCreator
    ? (onboardingConfig?.createProfileCreditsReward ?? 0)
    : 0;
};
