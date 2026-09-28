import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useState } from 'react';

type OnboardingUpgradeTrialCreditsLoss = {
  previousUpgradeTrialCredits: number;
  lostCredits: number;
  lossCount: number;
};

export const useOnboardingUpgradeTrialCreditsLoss = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { upgradeTrial } = useAtomFamilyStateValue(
    onboardingFreeCreditsFamilyState,
    currentWorkspace?.id ?? '',
  );
  const [creditsLoss, setCreditsLoss] =
    useState<OnboardingUpgradeTrialCreditsLoss>({
      previousUpgradeTrialCredits: upgradeTrial,
      lostCredits: 0,
      lossCount: 0,
    });

  if (upgradeTrial !== creditsLoss.previousUpgradeTrialCredits) {
    const isUpgradeTrialCreditsLost = upgradeTrial === 0;

    setCreditsLoss({
      previousUpgradeTrialCredits: upgradeTrial,
      lostCredits: isUpgradeTrialCreditsLost
        ? creditsLoss.previousUpgradeTrialCredits
        : 0,
      lossCount: isUpgradeTrialCreditsLost
        ? creditsLoss.lossCount + 1
        : creditsLoss.lossCount,
    });
  }

  const clearCreditsLoss = () =>
    setCreditsLoss((currentCreditsLoss) => ({
      ...currentCreditsLoss,
      lostCredits: 0,
    }));

  return {
    lostCredits: creditsLoss.lostCredits,
    lossCount: creditsLoss.lossCount,
    clearCreditsLoss,
  };
};
