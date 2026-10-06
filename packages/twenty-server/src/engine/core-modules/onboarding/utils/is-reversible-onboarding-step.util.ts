import { isString } from '@sniptt/guards';

import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { type ReversibleOnboardingStep } from 'src/engine/core-modules/onboarding/types/reversible-onboarding-step.type';

const REVERSIBLE_ONBOARDING_STEPS = {
  [OnboardingStatus.SYNC_EMAIL]: true,
  [OnboardingStatus.PROFILE_CREATION]: true,
  [OnboardingStatus.INVITE_TEAM]: true,
  [OnboardingStatus.BOOK_CALL]: true,
} as const satisfies Record<ReversibleOnboardingStep, true>;

export const isReversibleOnboardingStep = (
  value: unknown,
): value is ReversibleOnboardingStep =>
  isString(value) &&
  Object.prototype.hasOwnProperty.call(REVERSIBLE_ONBOARDING_STEPS, value);
