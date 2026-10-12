import { useSetCurrentWorkspaceOnboardingFreeCredits } from '@/onboarding/hooks/useSetCurrentWorkspaceOnboardingFreeCredits';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { useStore } from 'jotai';

export const useMarkOnboardingFreeCreditsAsSeen = () => {
  const store = useStore();
  const setOnboardingFreeCredits =
    useSetCurrentWorkspaceOnboardingFreeCredits();

  return () => {
    const { earnedCredits } = store.get(onboardingCreditsProgressSelector.atom);

    setOnboardingFreeCredits((current) => ({
      ...current,
      seenCredits: earnedCredits,
    }));
  };
};
