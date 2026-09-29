import { currentUserState } from '@/auth/states/currentUserState';
import { useSetCurrentWorkspaceOnboardingFreeCredits } from '@/onboarding/hooks/useSetCurrentWorkspaceOnboardingFreeCredits';
import { currentWorkspaceOnboardingFreeCreditsSelector } from '@/onboarding/states/selectors/currentWorkspaceOnboardingFreeCreditsSelector';
import { getOnboardingCountedFreeCredits } from '@/onboarding/utils/getOnboardingCountedFreeCredits';
import { getOnboardingEarnedCredits } from '@/onboarding/utils/getOnboardingEarnedCredits';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';

export const useOnboardingNewlyEarnedCredits = () => {
  const store = useStore();
  const currentWorkspaceOnboardingFreeCredits = useAtomStateValue(
    currentWorkspaceOnboardingFreeCreditsSelector,
  );
  const currentUser = useAtomStateValue(currentUserState);
  const setOnboardingFreeCredits =
    useSetCurrentWorkspaceOnboardingFreeCredits();

  const onboardingStatus = currentUser?.onboardingStatus;
  const { seenCredits } = currentWorkspaceOnboardingFreeCredits;

  const markCreditsAsSeen = () => {
    const earnedCredits = getOnboardingEarnedCredits(
      getOnboardingCountedFreeCredits({
        onboardingFreeCredits: store.get(
          currentWorkspaceOnboardingFreeCreditsSelector.atom,
        ),
        onboardingStatus: store.get(currentUserState.atom)?.onboardingStatus,
      }),
    );

    setOnboardingFreeCredits((current) => ({
      ...current,
      seenCredits: earnedCredits,
    }));
  };

  return {
    seenCredits,
    newlyEarnedCredits:
      getOnboardingEarnedCredits(
        getOnboardingCountedFreeCredits({
          onboardingFreeCredits: currentWorkspaceOnboardingFreeCredits,
          onboardingStatus,
        }),
      ) - seenCredits,
    isFirstCreditsGain: seenCredits === 0,
    markCreditsAsSeen,
  };
};
