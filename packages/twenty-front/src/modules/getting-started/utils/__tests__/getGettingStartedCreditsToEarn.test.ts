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
      remainingSteps: [
        GettingStartedStep.CONNECT_MAILBOX,
        GettingStartedStep.INVITE_TEAM,
      ],
      isWorkspaceCreator: true,
      expectedCredits: 3,
    },
    {
      description: 'skips the mailbox reward for other members',
      remainingSteps: [
        GettingStartedStep.CONNECT_MAILBOX,
        GettingStartedStep.INVITE_TEAM,
      ],
      isWorkspaceCreator: false,
      expectedCredits: 2,
    },
    {
      description: 'skips reward steps that are done or not in the track',
      remainingSteps: [GettingStartedStep.IMPORT_DATA],
      isWorkspaceCreator: true,
      expectedCredits: 0,
    },
  ])(
    '$description',
    ({ remainingSteps, isWorkspaceCreator, expectedCredits }) => {
      expect(
        getGettingStartedCreditsToEarn({
          remainingSteps,
          onboardingConfig: ONBOARDING_CONFIG,
          isWorkspaceCreator,
        }),
      ).toBe(expectedCredits);
    },
  );
});
