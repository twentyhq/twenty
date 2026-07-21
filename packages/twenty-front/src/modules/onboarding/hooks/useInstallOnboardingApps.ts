import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useTriggerInstallAppsOnboardingStep } from '@/onboarding/hooks/useTriggerInstallAppsOnboardingStep';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useState } from 'react';

export const useInstallOnboardingApps = () => {
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);
  const triggerInstallAppsOnboardingStep =
    useTriggerInstallAppsOnboardingStep();

  const [selectedUniversalIdentifiers, setSelectedUniversalIdentifiers] =
    useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const toggleApp = (universalIdentifier: string) => {
    setSelectedUniversalIdentifiers((current) =>
      current.includes(universalIdentifier)
        ? current.filter((identifier) => identifier !== universalIdentifier)
        : [...current, universalIdentifier],
    );
  };

  const triggerStep = async (universalIdentifiers: string[]) => {
    if (isCompleting) {
      return;
    }
    setIsCompleting(true);

    try {
      await triggerInstallAppsOnboardingStep(universalIdentifiers);

      const creditsRewardPerApp =
        onboardingConfig?.installAppsCreditsRewardPerApp ?? 0;

      setOnboardingFreeCredits((current) => ({
        ...current,
        installApps: creditsRewardPerApp * universalIdentifiers.length,
      }));
    } catch {
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
