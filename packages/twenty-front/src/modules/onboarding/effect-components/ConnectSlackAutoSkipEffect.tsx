import { useSkipConnectSlackOnboardingStep } from '@/onboarding/hooks/useSkipConnectSlackOnboardingStep';
import { useEffect, useRef } from 'react';

type ConnectSlackAutoSkipEffectProps = {
  onError: () => void;
};

export const ConnectSlackAutoSkipEffect = ({
  onError,
}: ConnectSlackAutoSkipEffectProps) => {
  const skipConnectSlackOnboardingStep = useSkipConnectSlackOnboardingStep();

  // oxlint-disable-next-line twenty/no-state-useref
  const hasSkippedRef = useRef(false);

  useEffect(() => {
    if (hasSkippedRef.current) {
      return;
    }
    hasSkippedRef.current = true;

    const skip = async () => {
      try {
        await skipConnectSlackOnboardingStep({ isAutoSkipped: true });
      } catch {
        onError();
      }
    };

    void skip();
  }, [skipConnectSlackOnboardingStep, onError]);

  return null;
};
