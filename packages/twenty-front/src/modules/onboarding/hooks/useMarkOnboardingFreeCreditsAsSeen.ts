import { useSetCurrentWorkspaceOnboardingFreeCredits } from '@/onboarding/hooks/useSetCurrentWorkspaceOnboardingFreeCredits';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useMarkOnboardingFreeCreditsAsSeen = () => {
  const store = useStore();
  const setOnboardingFreeCredits =
    useSetCurrentWorkspaceOnboardingFreeCredits();

  return () => {
    const progress = store.get(onboardingCreditsProgressSelector.atom);

    if (!isDefined(progress)) {
      return;
    }

    setOnboardingFreeCredits((current) => ({
      ...current,
      seenCredits: progress.earnedCredits,
    }));
  };
};
