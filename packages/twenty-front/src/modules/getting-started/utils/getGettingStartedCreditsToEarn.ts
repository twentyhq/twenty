import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { GettingStartedStep } from '~/generated-metadata/graphql';

export const getGettingStartedCreditsToEarn = ({
  completedSteps,
  onboardingConfig,
  isWorkspaceCreator,
}: {
  completedSteps: GettingStartedStep[];
  onboardingConfig: OnboardingConfig;
  isWorkspaceCreator: boolean;
}): number => {
  const mailboxCredits =
    isWorkspaceCreator &&
    !completedSteps.includes(GettingStartedStep.CONNECT_MAILBOX)
      ? onboardingConfig.importContactsCreditsReward
      : 0;
  const inviteCredits = completedSteps.includes(GettingStartedStep.INVITE_TEAM)
    ? 0
    : onboardingConfig.inviteTeamCreditsRewardPerUser *
      onboardingConfig.inviteTeamMaxInvites;

  return mailboxCredits + inviteCredits;
};
