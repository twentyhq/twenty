import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { ONBOARDING_INSTALLABLE_APPS } from '@/onboarding/constants/OnboardingInstallableApps';
import { useInstallOnboardingApps } from '@/onboarding/hooks/useInstallOnboardingApps';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { InstallAppsContent } from '~/pages/onboarding/InstallAppsContent';

export const InstallApps = () => {
  const { data: marketplaceApps } = useMarketplaceApps();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const {
    selectedUniversalIdentifiers,
    isCompleting,
    toggleApp,
    installSelectedAppsAndContinue,
    skip,
  } = useInstallOnboardingApps();

  const apps = ONBOARDING_INSTALLABLE_APPS.map((app) => ({
    ...app,
    logo:
      marketplaceApps.find(
        (marketplaceApp) => marketplaceApp.id === app.universalIdentifier,
      )?.logo ?? null,
  }));

  return (
    <InstallAppsContent
      apps={apps}
      selectedUniversalIdentifiers={selectedUniversalIdentifiers}
      creditsRewardPerApp={onboardingConfig?.installAppsCreditsRewardPerApp}
      isCompleting={isCompleting}
      onToggleApp={toggleApp}
      onInstall={installSelectedAppsAndContinue}
      onSkip={skip}
    />
  );
};
