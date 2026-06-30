import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { CreditInstallAppsOnboardingRewardDocument } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useInstallOnboardingApps = () => {
  const navigateApp = useNavigateApp();
  const { install } = useInstallMarketplaceApp();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);
  const [creditInstallAppsOnboardingReward] = useMutation(
    CreditInstallAppsOnboardingRewardDocument,
  );
  const [isInstalling, setIsInstalling] = useState(false);
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

  const installSelectedAppsAndContinue = async () => {
    setIsInstalling(true);

    const installResults = await Promise.all(
      selectedUniversalIdentifiers.map((universalIdentifier) =>
        install({ universalIdentifier }).then((result) =>
          isDefined(result) ? universalIdentifier : null,
        ),
      ),
    );

    const installedUniversalIdentifiers = installResults.filter(isDefined);
    const creditsRewardPerApp =
      onboardingConfig?.installAppsCreditsRewardPerApp ?? 0;

    setOnboardingFreeCredits((current) => ({
      ...current,
      installApps: creditsRewardPerApp * installedUniversalIdentifiers.length,
    }));

    if (installedUniversalIdentifiers.length > 0) {
      await creditInstallAppsOnboardingReward({
        variables: { universalIdentifiers: installedUniversalIdentifiers },
      }).catch(() => null);
    }

    goToNextStep();
  };

  const skip = () => {
    setOnboardingFreeCredits((current) => ({ ...current, installApps: 0 }));

    goToNextStep();
  };

  return {
    selectedUniversalIdentifiers,
    isInstalling,
    toggleApp,
    installSelectedAppsAndContinue,
    skip,
  };
};
