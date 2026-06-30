import { useCompleteInstallAppsOnboardingStep } from '@/onboarding/hooks/useCompleteInstallAppsOnboardingStep';
import { useEffect, useRef } from 'react';

type InstallAppsAutoSkipEffectProps = {
  onError: () => void;
};

export const InstallAppsAutoSkipEffect = ({
  onError,
}: InstallAppsAutoSkipEffectProps) => {
  const completeInstallAppsOnboardingStep =
    useCompleteInstallAppsOnboardingStep();

  // oxlint-disable-next-line twenty/no-state-useref
  const hasSkippedRef = useRef(false);

  useEffect(() => {
    if (hasSkippedRef.current) {
      return;
    }
    hasSkippedRef.current = true;

    const skip = async () => {
      try {
        await completeInstallAppsOnboardingStep([]);
      } catch {
        onError();
      }
    };

    void skip();
  }, [completeInstallAppsOnboardingStep, onError]);

  return null;
};
