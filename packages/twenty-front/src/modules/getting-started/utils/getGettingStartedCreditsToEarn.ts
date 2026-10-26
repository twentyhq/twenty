import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { GettingStartedStep } from '~/generated-metadata/graphql';

export const getGettingStartedCreditsToEarn = ({
  remainingSteps,
  onboardingConfig,
  isWorkspaceCreator,
}: {
  remainingSteps: GettingStartedStep[];
  onboardingConfig: OnboardingConfig;
  isWorkspaceCreator: boolean;
}): number => {
  const mailboxCredits =
    isWorkspaceCreator &&
    remainingSteps.includes(GettingStartedStep.CONNECT_MAILBOX)
      ? onboardingConfig.importContactsCreditsReward
      : 0;
  const inviteCredits = remainingSteps.includes(GettingStartedStep.INVITE_TEAM)
    ? onboardingConfig.inviteTeamCreditsRewardPerUser *
      onboardingConfig.inviteTeamMaxInvites
    : 0;

  return mailboxCredits + inviteCredits;
};
