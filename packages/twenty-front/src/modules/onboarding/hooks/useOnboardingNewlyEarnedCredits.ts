import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { getOnboardingEarnedCredits } from '@/onboarding/utils/getOnboardingEarnedCredits';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useOnboardingNewlyEarnedCredits = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [onboardingFreeCredits, setOnboardingFreeCredits] = useAtomFamilyState(
    onboardingFreeCreditsFamilyState,
    currentWorkspace?.id ?? '',
  );

  const { seenCredits } = onboardingFreeCredits;

  const markCreditsAsSeen = () =>
    setOnboardingFreeCredits((current) => ({
      ...current,
      seenCredits: getOnboardingEarnedCredits(current),
    }));

  return {
    seenCredits,
    newlyEarnedCredits:
      getOnboardingEarnedCredits(onboardingFreeCredits) - seenCredits,
    isFirstCreditsGain: seenCredits === 0,
    markCreditsAsSeen,
  };
};
