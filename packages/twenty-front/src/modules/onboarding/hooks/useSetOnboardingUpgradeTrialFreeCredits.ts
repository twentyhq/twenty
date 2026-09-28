import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSetOnboardingUpgradeTrialFreeCredits = () => {
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();

  return (isTrialUpgraded: boolean) =>
    setOnboardingStepFreeCredits(
      'upgradeTrial',
      isTrialUpgraded ? (onboardingConfig?.upgradeCreditsReward ?? 0) : 0,
    );
};
