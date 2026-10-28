import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { type OnboardingStepReward } from 'src/engine/core-modules/onboarding/types/onboarding-step-reward.type';

export const GETTING_STARTED_STEP_REWARDS: Partial<
  Record<GettingStartedStep, OnboardingStepReward>
> = {
  [GettingStartedStep.CONNECT_MAILBOX]: 'importContacts',
  [GettingStartedStep.INVITE_TEAM]: 'inviteTeam',
};
