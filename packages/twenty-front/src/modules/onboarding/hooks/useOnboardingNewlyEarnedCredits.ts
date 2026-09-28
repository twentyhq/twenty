import { useSetCurrentWorkspaceOnboardingFreeCredits } from '@/onboarding/hooks/useSetCurrentWorkspaceOnboardingFreeCredits';
import { currentWorkspaceOnboardingFreeCreditsSelector } from '@/onboarding/states/selectors/currentWorkspaceOnboardingFreeCreditsSelector';
import { getOnboardingEarnedCredits } from '@/onboarding/utils/getOnboardingEarnedCredits';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useOnboardingNewlyEarnedCredits = () => {
  const currentWorkspaceOnboardingFreeCredits = useAtomStateValue(
    currentWorkspaceOnboardingFreeCreditsSelector,
  );
  const setOnboardingFreeCredits =
    useSetCurrentWorkspaceOnboardingFreeCredits();

  const { seenCredits } = currentWorkspaceOnboardingFreeCredits;

  const markCreditsAsSeen = () =>
    setOnboardingFreeCredits((current) => ({
      ...current,
      seenCredits: getOnboardingEarnedCredits(current),
    }));

  return {
    seenCredits,
    newlyEarnedCredits:
      getOnboardingEarnedCredits(currentWorkspaceOnboardingFreeCredits) -
      seenCredits,
    isFirstCreditsGain: seenCredits === 0,
    markCreditsAsSeen,
  };
};
