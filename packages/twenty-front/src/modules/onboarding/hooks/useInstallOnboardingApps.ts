import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useInstallOnboardingApps = () => {
  const navigateApp = useNavigateApp();
  const { install } = useInstallMarketplaceApp();
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
    for (const universalIdentifier of selectedUniversalIdentifiers) {
      void install({ universalIdentifier });
    }
    goToNextStep();
  };

  return {
    selectedUniversalIdentifiers,
    toggleApp,
    installSelectedAppsAndContinue,
    skip: goToNextStep,
  };
};
