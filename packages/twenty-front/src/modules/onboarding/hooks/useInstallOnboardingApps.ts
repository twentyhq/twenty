import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { useCompleteInstallAppsOnboardingStep } from '@/onboarding/hooks/useCompleteInstallAppsOnboardingStep';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useRef, useState } from 'react';

export const useInstallOnboardingApps = () => {
  const { install } = useInstallMarketplaceApp();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);
  const completeInstallAppsOnboardingStep =
    useCompleteInstallAppsOnboardingStep();
  const [selectedUniversalIdentifiers, setSelectedUniversalIdentifiers] =
    useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  // Guards against a double-click completing the step twice, which would
  // advance the onboarding status one step too far (skipping create-profile).
  // oxlint-disable-next-line twenty/no-state-useref
  const isCompletingRef = useRef(false);

  const toggleApp = (universalIdentifier: string) => {
    setSelectedUniversalIdentifiers((current) =>
      current.includes(universalIdentifier)
        ? current.filter((identifier) => identifier !== universalIdentifier)
        : [...current, universalIdentifier],
    );
  };

  const installSelectedAppsAndContinue = async () => {
    if (isCompletingRef.current) {
      return;
    }
    isCompletingRef.current = true;
    setIsCompleting(true);

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
    if (isCompletingRef.current) {
      return;
    }
    isCompletingRef.current = true;
    setIsCompleting(true);

    setOnboardingFreeCredits((current) => ({ ...current, installApps: 0 }));

    await completeInstallAppsOnboardingStep([]);
  };

  return {
    selectedUniversalIdentifiers,
    isCompleting,
    toggleApp,
    installSelectedAppsAndContinue,
    skip,
  };
};
