import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { useCompleteInstallAppsOnboardingStep } from '@/onboarding/hooks/useCompleteInstallAppsOnboardingStep';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useState } from 'react';

export const useInstallOnboardingApps = () => {
  const { install } = useInstallMarketplaceApp();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);
  const completeInstallAppsOnboardingStep =
    useCompleteInstallAppsOnboardingStep();
  const [selectedUniversalIdentifiers, setSelectedUniversalIdentifiers] =
    useState<string[]>([]);

  const toggleApp = (universalIdentifier: string) => {
    setSelectedUniversalIdentifiers((current) =>
      current.includes(universalIdentifier)
        ? current.filter((identifier) => identifier !== universalIdentifier)
        : [...current, universalIdentifier],
    );
  };

  const installSelectedAppsAndContinue = async () => {
    for (const universalIdentifier of selectedUniversalIdentifiers) {
      void install({ universalIdentifier });
    }

    const creditsRewardPerApp =
      onboardingConfig?.installAppsCreditsRewardPerApp ?? 0;

    setOnboardingFreeCredits((current) => ({
      ...current,
      installApps: creditsRewardPerApp * selectedUniversalIdentifiers.length,
    }));

    await completeInstallAppsOnboardingStep(selectedUniversalIdentifiers);
  };

  const skip = async () => {
    setOnboardingFreeCredits((current) => ({ ...current, installApps: 0 }));

    await completeInstallAppsOnboardingStep([]);
  };

  return {
    selectedUniversalIdentifiers,
    toggleApp,
    installSelectedAppsAndContinue,
    skip,
  };
};
