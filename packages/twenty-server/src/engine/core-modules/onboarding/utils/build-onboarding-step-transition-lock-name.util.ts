import { ONBOARDING_STEP_TRANSITION_LOCK_PREFIX } from 'src/engine/core-modules/onboarding/constants/onboarding-step-transition-lock-prefix';

export const buildOnboardingStepTransitionLockName = ({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}): string =>
  `${ONBOARDING_STEP_TRANSITION_LOCK_PREFIX}:${userId}:${workspaceId}`;
