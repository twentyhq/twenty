import { useSkipSyncEmailOnboardingStep } from '@/onboarding/hooks/useSkipSyncEmailOnboardingStep';
import { useEffect, useRef } from 'react';

type SyncEmailsAutoSkipEffectProps = {
  onError: () => void;
};

export const SyncEmailsAutoSkipEffect = ({
  onError,
}: SyncEmailsAutoSkipEffectProps) => {
  const skipSyncEmailOnboardingStep = useSkipSyncEmailOnboardingStep();

  // oxlint-disable-next-line twenty/no-state-useref
  const hasSkippedRef = useRef(false);

  useEffect(() => {
    if (hasSkippedRef.current) {
      return;
    }
    hasSkippedRef.current = true;

    const skip = async () => {
      try {
        await skipSyncEmailOnboardingStep();
      } catch {
        onError();
      }
    };

    void skip();
  }, [skipSyncEmailOnboardingStep, onError]);

  return null;
};
