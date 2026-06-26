import { useSkipSyncEmailOnboardingStep } from '@/onboarding/hooks/useSkipSyncEmailOnboardingStep';
import { useEffect, useRef } from 'react';

export const SyncEmailsAutoSkipEffect = () => {
  const skipSyncEmailOnboardingStep = useSkipSyncEmailOnboardingStep();

  // oxlint-disable-next-line twenty/no-state-useref
  const hasSkippedRef = useRef(false);

  useEffect(() => {
    if (hasSkippedRef.current) {
      return;
    }
    hasSkippedRef.current = true;
    void skipSyncEmailOnboardingStep();
  }, [skipSyncEmailOnboardingStep]);

  return null;
};
