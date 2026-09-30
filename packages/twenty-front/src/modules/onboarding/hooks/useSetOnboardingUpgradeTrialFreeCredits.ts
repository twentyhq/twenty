import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingUpgradeTrialLostCreditsState } from '@/onboarding/states/onboardingUpgradeTrialLostCreditsState';
import { currentWorkspaceOnboardingFreeCreditsSelector } from '@/onboarding/states/selectors/currentWorkspaceOnboardingFreeCreditsSelector';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { useStore } from 'jotai';

export const useSetOnboardingUpgradeTrialFreeCredits = () => {
  const store = useStore();
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();

  return (isTrialUpgraded: boolean) => {
    const upgradeTrialCredits = isTrialUpgraded
      ? store.get(onboardingCreditsProgressSelector.atom).rewardCreditsByStep
          .upgradeTrial
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
