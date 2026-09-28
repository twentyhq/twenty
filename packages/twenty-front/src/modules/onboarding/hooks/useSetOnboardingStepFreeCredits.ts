import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { getOnboardingEarnedCredits } from '@/onboarding/utils/getOnboardingEarnedCredits';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback } from 'react';

type SetOnboardingStepFreeCreditsOptions = {
  isQuiet?: boolean;
};

export const useSetOnboardingStepFreeCredits = () => {
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);

  return useCallback(
    (
      step: OnboardingCreditsStep,
      credits: number,
      { isQuiet = false }: SetOnboardingStepFreeCreditsOptions = {},
    ) =>
      setOnboardingFreeCredits((current) => {
        const onboardingFreeCredits = { ...current, [step]: credits };
        const quietCreditsChange = isQuiet ? credits - current[step] : 0;

        return {
          ...onboardingFreeCredits,
          seenCredits: Math.min(
            Math.max(0, current.seenCredits + quietCreditsChange),
            getOnboardingEarnedCredits(onboardingFreeCredits),
          ),
        };
      }),
    [setOnboardingFreeCredits],
  );
};
