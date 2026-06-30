import { useCompleteInstallAppsOnboardingStep } from '@/onboarding/hooks/useCompleteInstallAppsOnboardingStep';
import { useEffect, useRef } from 'react';

export const InstallAppsAutoSkipEffect = () => {
  const completeInstallAppsOnboardingStep =
    useCompleteInstallAppsOnboardingStep();

  // oxlint-disable-next-line twenty/no-state-useref
  const hasSkippedRef = useRef(false);

  useEffect(() => {
    if (hasSkippedRef.current) {
      return;
    }
    hasSkippedRef.current = true;

    void completeInstallAppsOnboardingStep([]);
  }, [completeInstallAppsOnboardingStep]);

  return null;
};
