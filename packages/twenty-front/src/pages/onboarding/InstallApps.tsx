import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { ONBOARDING_INSTALLABLE_APPS } from '@/onboarding/constants/OnboardingInstallableApps';
import { InstallAppsAutoSkipEffect } from '@/onboarding/effect-components/InstallAppsAutoSkipEffect';
import { useInstallOnboardingApps } from '@/onboarding/hooks/useInstallOnboardingApps';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCallback, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { InstallAppsContent } from '~/pages/onboarding/InstallAppsContent';

const ONBOARDING_INSTALLABLE_APP_UNIVERSAL_IDENTIFIERS =
  ONBOARDING_INSTALLABLE_APPS.map((app) => app.universalIdentifier);

export const InstallApps = () => {
  const {
    data: marketplaceApps,
    isLoading,
    error,
  } = useMarketplaceApps({
    universalIdentifiers: ONBOARDING_INSTALLABLE_APP_UNIVERSAL_IDENTIFIERS,
  });
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const {
    selectedUniversalIdentifiers,
    isCompleting,
    toggleApp,
    installSelectedAppsAndContinue,
    skip,
  } = useInstallOnboardingApps();
  const [hasAutoSkipFailed, setHasAutoSkipFailed] = useState(false);

  const availableApps = ONBOARDING_INSTALLABLE_APPS.flatMap((app) => {
    const marketplaceApp = marketplaceApps.find(
      (marketplaceApp) => marketplaceApp.id === app.universalIdentifier,
    );

    return isDefined(marketplaceApp)
      ? [{ ...app, logo: marketplaceApp.logo ?? null }]
      : [];
  });

  const handleAutoSkipError = useCallback(() => {
    setHasAutoSkipFailed(true);
  }, []);

  if (isLoading) {
    return null;
  }

  const hasLoadedAvailabilitySuccessfully = !isDefined(error);
  const shouldAutoSkip =
    hasLoadedAvailabilitySuccessfully &&
    !isNonEmptyArray(availableApps) &&
    !hasAutoSkipFailed;

  if (shouldAutoSkip) {
    return <InstallAppsAutoSkipEffect onError={handleAutoSkipError} />;
  }

  return (
    <InstallAppsContent
      apps={availableApps}
      selectedUniversalIdentifiers={selectedUniversalIdentifiers}
      creditsRewardPerApp={onboardingConfig?.installAppsCreditsRewardPerApp}
      isCompleting={isCompleting}
      onToggleApp={toggleApp}
      onInstall={installSelectedAppsAndContinue}
      onSkip={skip}
    />
  );
};
