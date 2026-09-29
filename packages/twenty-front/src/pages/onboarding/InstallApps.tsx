import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { ONBOARDING_INSTALLABLE_APPS } from '@/onboarding/constants/OnboardingInstallableApps';
import { InstallAppsAutoSkipEffect } from '@/onboarding/effect-components/InstallAppsAutoSkipEffect';
import { useInstallOnboardingApps } from '@/onboarding/hooks/useInstallOnboardingApps';
import { useOnboardingStepEnterHotkey } from '@/onboarding/hooks/useOnboardingStepEnterHotkey';
import { onboardingRewardCreditsByStepSelector } from '@/onboarding/states/selectors/onboardingRewardCreditsByStepSelector';
import { PageFocusId } from '@/types/PageFocusId';
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
  const [hasAutoSkipFailed, setHasAutoSkipFailed] = useState(false);

  const availableApps = ONBOARDING_INSTALLABLE_APPS.flatMap((app) => {
    const marketplaceApp = marketplaceApps.find(
      (marketplaceApp) =>
        marketplaceApp.id === app.universalIdentifier &&
        marketplaceApp.isVetted,
    );

    return isDefined(marketplaceApp)
      ? [{ ...app, logoUrl: marketplaceApp.logoUrl ?? null }]
      : [];
  });

  const {
    selectedUniversalIdentifiers,
    isCompleting,
    toggleApp,
    installSelectedAppsAndContinue,
    skip,
  } = useInstallOnboardingApps(
    availableApps.map((app) => app.universalIdentifier),
  );

  const { installApps: installAppsCreditsReward } = useAtomStateValue(
    onboardingRewardCreditsByStepSelector,
  );

  useOnboardingStepEnterHotkey({
    focusId: PageFocusId.InstallApps,
    onEnter: () => {
      if (isLoading) {
        return;
      }

      void installSelectedAppsAndContinue();
    },
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
      isCompleting={isCompleting}
      creditsReward={installAppsCreditsReward}
      onToggleApp={toggleApp}
      onInstall={installSelectedAppsAndContinue}
      onSkip={skip}
    />
  );
};
