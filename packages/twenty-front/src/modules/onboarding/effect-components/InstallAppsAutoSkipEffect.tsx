import { useTriggerInstallAppsOnboardingStep } from '@/onboarding/hooks/useTriggerInstallAppsOnboardingStep';
import { useEffect, useRef } from 'react';

type InstallAppsAutoSkipEffectProps = {
  onError: () => void;
};

export const InstallAppsAutoSkipEffect = ({
  onError,
}: InstallAppsAutoSkipEffectProps) => {
  const triggerInstallAppsOnboardingStep =
    useTriggerInstallAppsOnboardingStep();

  // oxlint-disable-next-line twenty/no-state-useref
  const hasSkippedRef = useRef(false);

  useEffect(() => {
    if (hasSkippedRef.current) {
      return;
    }
    hasSkippedRef.current = true;

    const skip = async () => {
      try {
        await triggerInstallAppsOnboardingStep([]);
      } catch {
        onError();
      }
    };

    void skip();
  }, [triggerInstallAppsOnboardingStep, onError]);

  return null;
};
