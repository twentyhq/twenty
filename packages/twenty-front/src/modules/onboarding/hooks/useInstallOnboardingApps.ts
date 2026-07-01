import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useTriggerInstallAppsOnboardingStep } from '@/onboarding/hooks/useTriggerInstallAppsOnboardingStep';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useRef, useState } from 'react';

export const useInstallOnboardingApps = () => {
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);
  const triggerInstallAppsOnboardingStep =
    useTriggerInstallAppsOnboardingStep();
  const [selectedUniversalIdentifiers, setSelectedUniversalIdentifiers] =
    useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

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

    try {
      await triggerInstallAppsOnboardingStep(selectedUniversalIdentifiers);

      const creditsRewardPerApp =
        onboardingConfig?.installAppsCreditsRewardPerApp ?? 0;

      setOnboardingFreeCredits((current) => ({
        ...current,
        installApps: creditsRewardPerApp * selectedUniversalIdentifiers.length,
      }));
    } catch {
      isCompletingRef.current = false;
      setIsCompleting(false);
    }
  };

  const skip = async () => {
    if (isCompletingRef.current) {
      return;
    }
    isCompletingRef.current = true;
    setIsCompleting(true);

    try {
      await triggerInstallAppsOnboardingStep([]);

      setOnboardingFreeCredits((current) => ({ ...current, installApps: 0 }));
    } catch {
      isCompletingRef.current = false;
      setIsCompleting(false);
    }
  };

  return {
    selectedUniversalIdentifiers,
    isCompleting,
    toggleApp,
    installSelectedAppsAndContinue,
    skip,
  };
};
