import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { useTriggerInstallAppsOnboardingStep } from '@/onboarding/hooks/useTriggerInstallAppsOnboardingStep';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { useStore } from 'jotai';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const useInstallOnboardingApps = (
  availableUniversalIdentifiers: string[],
) => {
  const store = useStore();
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();
  const triggerInstallAppsOnboardingStep =
    useTriggerInstallAppsOnboardingStep();

  const [deselectedUniversalIdentifiers, setDeselectedUniversalIdentifiers] =
    useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

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

    const installAppsCreditsReward = store.get(
      onboardingCreditsProgressSelector.atom,
    ).rewardCreditsByStep.installApps;

    setOnboardingStepFreeCredits(
      'installApps',
      isNonEmptyArray(universalIdentifiers) ? installAppsCreditsReward : 0,
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
    toggleApp,
    installSelectedAppsAndContinue: () =>
      triggerStep(selectedUniversalIdentifiers),
    skip: () => triggerStep([]),
  };
};
