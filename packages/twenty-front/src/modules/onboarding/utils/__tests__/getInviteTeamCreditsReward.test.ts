import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { getInviteTeamCreditsReward } from '@/onboarding/utils/getInviteTeamCreditsReward';

const onboardingConfig: OnboardingConfig = {
  importContactsCreditsReward: 1,
  inviteTeamCreditsRewardPerUser: 0.5,
  installAppsCreditsReward: 0.5,
  createProfileCreditsReward: 0.5,
  upgradeCreditsReward: 2,
  inviteTeamMaxInvites: 3,
};

describe('getInviteTeamCreditsReward', () => {
  it('should reward each invited teammate', () => {
    expect(
      getInviteTeamCreditsReward({
        invitedTeammatesCount: 2,
        onboardingConfig,
      }),
    ).toBe(1);
  });

  it('should stop rewarding past the maximum invites', () => {
    expect(
      getInviteTeamCreditsReward({
        invitedTeammatesCount: 5,
        onboardingConfig,
      }),
    ).toBe(1.5);
  });

  it('should reward nothing before the config loads', () => {
    expect(
      getInviteTeamCreditsReward({
        invitedTeammatesCount: 2,
        onboardingConfig: null,
      }),
    ).toBe(0);
  });
});
