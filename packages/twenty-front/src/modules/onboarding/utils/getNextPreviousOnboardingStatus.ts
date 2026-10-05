import { type OnboardingStepHistoryEffect } from '@/onboarding/types/OnboardingStepHistoryEffect';
import { assertUnreachable } from 'twenty-shared/utils';
import { type OnboardingStatus } from '~/generated-metadata/graphql';

export const getNextPreviousOnboardingStatus = ({
  stepHistoryEffect,
  currentOnboardingStatus,
  currentPreviousOnboardingStatus,
}: {
  stepHistoryEffect: OnboardingStepHistoryEffect;
  currentOnboardingStatus: OnboardingStatus | null | undefined;
  currentPreviousOnboardingStatus: OnboardingStatus | null | undefined;
}): OnboardingStatus | null | undefined => {
  switch (stepHistoryEffect) {
    case 'recordAsReversible':
      return currentOnboardingStatus;
    case 'clearAfterIrreversibleStep':
      return null;
    case 'leaveUnchanged':
      return currentPreviousOnboardingStatus;
    default:
      return assertUnreachable(stepHistoryEffect);
  }
};
