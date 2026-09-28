import { currentUserState } from '@/auth/states/currentUserState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { useTriggerInstallAppsOnboardingStep } from '@/onboarding/hooks/useTriggerInstallAppsOnboardingStep';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const useInstallOnboardingApps = (
  availableUniversalIdentifiers: string[],
) => {
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const currentUser = useAtomStateValue(currentUserState);
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();
  const triggerInstallAppsOnboardingStep =
    useTriggerInstallAppsOnboardingStep();

  const [deselectedUniversalIdentifiers, setDeselectedUniversalIdentifiers] =
    useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const creditsReward = currentUser?.isWorkspaceCreator
    ? (onboardingConfig?.installAppsCreditsReward ?? 0)
    : 0;

  const selectedUniversalIdentifiers = availableUniversalIdentifiers.filter(
    (universalIdentifier) =>
      !deselectedUniversalIdentifiers.includes(universalIdentifier),
  );

  const toggleApp = (universalIdentifier: string) => {
    setDeselectedUniversalIdentifiers((currentDeselected) =>
      currentDeselected.includes(universalIdentifier)
        ? currentDeselected.filter(
            (identifier) => identifier !== universalIdentifier,
          )
        : [...currentDeselected, universalIdentifier],
    );
  };

  const triggerStep = async (universalIdentifiers: string[]) => {
    if (isCompleting) {
      return;
    }
    setIsCompleting(true);
    setOnboardingStepFreeCredits(
      'installApps',
      isNonEmptyArray(universalIdentifiers) ? creditsReward : 0,
    );

    try {
      await triggerInstallAppsOnboardingStep({
        universalIdentifiers,
        isAutoSkipped: false,
      });
    } catch {
      setOnboardingStepFreeCredits('installApps', 0);
      setIsCompleting(false);
    }
  };

  return {
    selectedUniversalIdentifiers,
    isCompleting,
    creditsReward,
    toggleApp,
    installSelectedAppsAndContinue: () =>
      triggerStep(selectedUniversalIdentifiers),
    skip: () => triggerStep([]),
  };
};
