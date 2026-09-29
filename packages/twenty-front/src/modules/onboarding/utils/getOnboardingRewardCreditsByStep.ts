import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';

type GetOnboardingRewardCreditsByStepArgs = {
  onboardingConfig: OnboardingConfig;
  isWorkspaceCreator: boolean;
  isPlanRequired: boolean;
};

export const getOnboardingRewardCreditsByStep = ({
  onboardingConfig,
  isWorkspaceCreator,
  isPlanRequired,
}: GetOnboardingRewardCreditsByStepArgs): Record<
  OnboardingCreditsStep,
  number
> => ({
  importContacts: isWorkspaceCreator
    ? onboardingConfig.importContactsCreditsReward
    : 0,
  installApps: isWorkspaceCreator
    ? onboardingConfig.installAppsCreditsReward
    : 0,
  createProfile: isWorkspaceCreator
    ? onboardingConfig.createProfileCreditsReward
    : 0,
  inviteTeam:
    onboardingConfig.inviteTeamCreditsRewardPerUser *
    onboardingConfig.inviteTeamMaxInvites,
  upgradeTrial: isPlanRequired ? onboardingConfig.upgradeCreditsReward : 0,
});
