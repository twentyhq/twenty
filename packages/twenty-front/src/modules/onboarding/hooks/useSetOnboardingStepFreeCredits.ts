import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { getOnboardingEarnedCredits } from '@/onboarding/utils/getOnboardingEarnedCredits';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback } from 'react';

export const useSetOnboardingStepFreeCredits = () => {
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);

  return useCallback(
    (step: OnboardingCreditsStep, credits: number) =>
      setOnboardingFreeCredits((current) => {
        const onboardingFreeCredits = { ...current, [step]: credits };

        return {
          ...onboardingFreeCredits,
          seenCredits: Math.min(
            current.seenCredits,
            getOnboardingEarnedCredits(onboardingFreeCredits),
          ),
        };
      }),
    [setOnboardingFreeCredits],
  );
};
