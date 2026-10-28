import { assertUnreachable } from 'twenty-shared/utils';

import { ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES } from 'src/engine/core-modules/onboarding/constants/onboarding-reward-idempotency-key-prefixes';
import { type OnboardingStepReward } from 'src/engine/core-modules/onboarding/types/onboarding-step-reward.type';

export const buildOnboardingRewardIdempotencyKeyPrefix = ({
  reward,
  workspaceId,
}: {
  reward: OnboardingStepReward;
  workspaceId: string;
}): string => {
  switch (reward) {
    case 'importContacts':
      return `${ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES.importContacts}:${workspaceId}`;
    case 'inviteTeam':
      return `${ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES.inviteTeam}:${workspaceId}:`;
    default:
      return assertUnreachable(reward);
  }
};
