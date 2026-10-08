import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { isDefined } from 'twenty-shared/utils';

type GetInviteTeamCreditsRewardArgs = {
  invitedTeammatesCount: number;
  onboardingConfig: OnboardingConfig | null;
};

export const getInviteTeamCreditsReward = ({
  invitedTeammatesCount,
  onboardingConfig,
}: GetInviteTeamCreditsRewardArgs) => {
  if (!isDefined(onboardingConfig)) {
    return 0;
  }

  const rewardedTeammatesCount = Math.min(
    invitedTeammatesCount,
    onboardingConfig.inviteTeamMaxInvites,
  );

  return (
    rewardedTeammatesCount * onboardingConfig.inviteTeamCreditsRewardPerUser
  );
};
