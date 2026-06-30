import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { OnboardingV2Layout } from '@/onboarding/components/OnboardingV2Layout';
import { ONBOARDING_INSTALLABLE_APPS } from '@/onboarding/constants/OnboardingInstallableApps';
import { useInstallOnboardingApps } from '@/onboarding/hooks/useInstallOnboardingApps';
import { useOnboardingFreeCreditsTotal } from '@/onboarding/hooks/useOnboardingFreeCreditsTotal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { InstallApps } from '~/pages/onboarding/InstallApps';

export const InstallAppsV2 = () => {
  const { data: marketplaceApps } = useMarketplaceApps();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const freeCreditsTotal = useOnboardingFreeCreditsTotal();
  const {
    selectedUniversalIdentifiers,
    isInstalling,
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
    <OnboardingV2Layout freeCredits={freeCreditsTotal}>
      <InstallApps
        apps={apps}
        selectedUniversalIdentifiers={selectedUniversalIdentifiers}
        creditsRewardPerApp={onboardingConfig?.installAppsCreditsRewardPerApp}
        isInstalling={isInstalling}
        onToggleApp={toggleApp}
        onInstall={installSelectedAppsAndContinue}
        onSkip={skip}
      />
    </OnboardingV2Layout>
  );
};
