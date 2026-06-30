import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useInstallOnboardingApps = () => {
  const navigateApp = useNavigateApp();
  const { install } = useInstallMarketplaceApp();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);
  const [selectedUniversalIdentifiers, setSelectedUniversalIdentifiers] =
    useState<string[]>([]);

  const toggleApp = (universalIdentifier: string) => {
    setSelectedUniversalIdentifiers((current) =>
      current.includes(universalIdentifier)
        ? current.filter((identifier) => identifier !== universalIdentifier)
        : [...current, universalIdentifier],
    );
  };

  const goToNextStep = () => {
    navigateApp(AppPath.CreateProfileV2);
  };

  const installSelectedAppsAndContinue = () => {
    const creditsRewardPerApp =
      onboardingConfig?.installAppsCreditsRewardPerApp ?? 0;

    setOnboardingFreeCredits((current) => ({
      ...current,
      installApps: creditsRewardPerApp * selectedUniversalIdentifiers.length,
    }));

    for (const universalIdentifier of selectedUniversalIdentifiers) {
      void install({ universalIdentifier });
    }

    goToNextStep();
  };

  const skip = () => {
    setOnboardingFreeCredits((current) => ({ ...current, installApps: 0 }));

    goToNextStep();
  };

  return {
    selectedUniversalIdentifiers,
    toggleApp,
    installSelectedAppsAndContinue,
    skip,
  };
};
