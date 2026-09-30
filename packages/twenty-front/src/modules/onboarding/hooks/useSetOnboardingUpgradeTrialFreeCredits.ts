import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingUpgradeTrialLostCreditsState } from '@/onboarding/states/onboardingUpgradeTrialLostCreditsState';
import { currentWorkspaceOnboardingFreeCreditsSelector } from '@/onboarding/states/selectors/currentWorkspaceOnboardingFreeCreditsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';

export const useSetOnboardingUpgradeTrialFreeCredits = () => {
  const store = useStore();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();

  return (isTrialUpgraded: boolean) => {
    const upgradeTrialCredits = isTrialUpgraded
      ? (onboardingConfig?.upgradeCreditsReward ?? 0)
      : 0;
    const { upgradeTrial: previousUpgradeTrialCredits } = store.get(
      currentWorkspaceOnboardingFreeCreditsSelector.atom,
    );

    if (upgradeTrialCredits !== previousUpgradeTrialCredits) {
      store.set(
        onboardingUpgradeTrialLostCreditsState.atom,
        upgradeTrialCredits === 0 ? previousUpgradeTrialCredits : 0,
      );
    }

    setOnboardingStepFreeCredits('upgradeTrial', upgradeTrialCredits, {
      isQuiet: true,
    });
  };
};
