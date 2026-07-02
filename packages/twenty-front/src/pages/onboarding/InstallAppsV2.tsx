import { isOnboardingV2State } from '@/auth/states/isOnboardingV2State';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { OnboardingV2Layout } from '@/onboarding/components/OnboardingV2Layout';
import { ONBOARDING_INSTALLABLE_APPS } from '@/onboarding/constants/OnboardingInstallableApps';
import { InstallAppsAutoSkipEffect } from '@/onboarding/effect-components/InstallAppsAutoSkipEffect';
import { useInstallOnboardingApps } from '@/onboarding/hooks/useInstallOnboardingApps';
import { useOnboardingFreeCreditsTotal } from '@/onboarding/hooks/useOnboardingFreeCreditsTotal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCallback, useState } from 'react';
import { InstallApps } from '~/pages/onboarding/InstallApps';

export const InstallAppsV2 = () => {
  const isOnboardingV2 = useAtomStateValue(isOnboardingV2State);
  const { data: marketplaceApps } = useMarketplaceApps();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const freeCreditsTotal = useOnboardingFreeCreditsTotal();
  const [hasAutoSkipFailed, setHasAutoSkipFailed] = useState(false);
  const {
    selectedUniversalIdentifiers,
    isCompleting,
    toggleApp,
    installSelectedAppsAndContinue,
    skip,
  } = useInstallOnboardingApps();

  const handleAutoSkipError = useCallback(() => {
    setHasAutoSkipFailed(true);
  }, []);

  if (!isOnboardingV2 && !hasAutoSkipFailed) {
    return <InstallAppsAutoSkipEffect onError={handleAutoSkipError} />;
  }

  const apps = ONBOARDING_INSTALLABLE_APPS.map((app) => ({
    ...app,
    logo:
      marketplaceApps.find(
        (marketplaceApp) => marketplaceApp.id === app.universalIdentifier,
      )?.logo ?? null,
  }));

  return (
    <OnboardingV2Layout freeCredits={freeCreditsTotal}>
      <InstallApps
        apps={apps}
        selectedUniversalIdentifiers={selectedUniversalIdentifiers}
        creditsRewardPerApp={onboardingConfig?.installAppsCreditsRewardPerApp}
        isCompleting={isCompleting}
        onToggleApp={toggleApp}
        onInstall={installSelectedAppsAndContinue}
        onSkip={skip}
      />
    </OnboardingV2Layout>
  );
};
