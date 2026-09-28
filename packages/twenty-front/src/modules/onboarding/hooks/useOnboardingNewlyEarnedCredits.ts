import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { getOnboardingEarnedCredits } from '@/onboarding/utils/getOnboardingEarnedCredits';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useOnboardingNewlyEarnedCredits = () => {
  const [onboardingFreeCredits, setOnboardingFreeCredits] = useAtomState(
    onboardingFreeCreditsState,
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
