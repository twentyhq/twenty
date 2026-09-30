import { ONBOARDING_CREDITS_STEPS } from '@/onboarding/constants/OnboardingCreditsSteps';
import { useSetCurrentWorkspaceOnboardingFreeCredits } from '@/onboarding/hooks/useSetCurrentWorkspaceOnboardingFreeCredits';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type SetOnboardingStepFreeCreditsOptions = {
  isQuiet?: boolean;
};

export const useSetOnboardingStepFreeCredits = () => {
  const store = useStore();
  const setOnboardingFreeCredits =
    useSetCurrentWorkspaceOnboardingFreeCredits();

  return useCallback(
    (
      step: OnboardingCreditsStep,
      credits: number,
      { isQuiet = false }: SetOnboardingStepFreeCreditsOptions = {},
    ) => {
      const earnedCredits = store.get(
        onboardingCreditsProgressSelector.atom,
      )?.earnedCredits;

      setOnboardingFreeCredits((current) => {
        const onboardingFreeCredits = { ...current, [step]: credits };
        const quietCreditsChange = isQuiet ? credits - current[step] : 0;
        const storedCredits = ONBOARDING_CREDITS_STEPS.reduce(
          (total, creditsStep) => total + onboardingFreeCredits[creditsStep],
          0,
        );
        const maxSeenCredits = isDefined(earnedCredits)
          ? Math.min(storedCredits, earnedCredits + quietCreditsChange)
          : storedCredits;

        return {
          ...onboardingFreeCredits,
          seenCredits: Math.min(
            Math.max(0, current.seenCredits + quietCreditsChange),
            maxSeenCredits,
          ),
        };
      });
    },
    [setOnboardingFreeCredits, store],
  );
};
