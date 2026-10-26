import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { getGettingStartedCreditsToEarn } from '@/getting-started/utils/getGettingStartedCreditsToEarn';
import { GettingStartedStep } from '~/generated-metadata/graphql';

const ONBOARDING_CONFIG: OnboardingConfig = {
  importContactsCreditsReward: 1,
  inviteTeamCreditsRewardPerUser: 0.5,
  createProfileCreditsReward: 0.5,
  upgradeCreditsReward: 2,
  inviteTeamMaxInvites: 4,
};

describe('getGettingStartedCreditsToEarn', () => {
  it.each([
    {
      description: 'counts the mailbox and every invite for the creator',
      completedSteps: [],
      isWorkspaceCreator: true,
      expectedCredits: 3,
    },
    {
      description: 'skips the mailbox reward for other members',
      completedSteps: [],
      isWorkspaceCreator: false,
      expectedCredits: 2,
    },
    {
      description: 'skips completed reward steps',
      completedSteps: [
        GettingStartedStep.CONNECT_MAILBOX,
        GettingStartedStep.INVITE_TEAM,
      ],
      isWorkspaceCreator: true,
      expectedCredits: 0,
    },
  ])(
    '$description',
    ({ completedSteps, isWorkspaceCreator, expectedCredits }) => {
      expect(
        getGettingStartedCreditsToEarn({
          completedSteps,
          onboardingConfig: ONBOARDING_CONFIG,
          isWorkspaceCreator,
        }),
      ).toBe(expectedCredits);
    },
  );
});
