import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { OnboardingV2Layout } from '@/onboarding/components/OnboardingV2Layout';
import { ONBOARDING_INSTALLABLE_APPS } from '@/onboarding/constants/OnboardingInstallableApps';
import { useInstallOnboardingApps } from '@/onboarding/hooks/useInstallOnboardingApps';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { InstallApps } from '~/pages/onboarding/InstallApps';

const INSTALL_APPS_FREE_CREDITS = 0;

export const InstallAppsV2 = () => {
  const { data: marketplaceApps } = useMarketplaceApps();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const {
    selectedUniversalIdentifiers,
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
    <OnboardingV2Layout freeCredits={INSTALL_APPS_FREE_CREDITS}>
      <InstallApps
        apps={apps}
        selectedUniversalIdentifiers={selectedUniversalIdentifiers}
        creditsRewardPerApp={onboardingConfig?.installAppsCreditsRewardPerApp}
        onToggleApp={toggleApp}
        onInstall={installSelectedAppsAndContinue}
        onSkip={skip}
      />
    </OnboardingV2Layout>
  );
};
