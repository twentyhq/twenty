import { currentUserState } from '@/auth/states/currentUserState';
import { useSetCurrentWorkspaceOnboardingFreeCredits } from '@/onboarding/hooks/useSetCurrentWorkspaceOnboardingFreeCredits';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { getOnboardingCountedFreeCredits } from '@/onboarding/utils/getOnboardingCountedFreeCredits';
import { getOnboardingEarnedCredits } from '@/onboarding/utils/getOnboardingEarnedCredits';
import { useStore } from 'jotai';
import { useCallback } from 'react';

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
    ) =>
      setOnboardingFreeCredits((current) => {
        const onboardingStatus = store.get(
          currentUserState.atom,
        )?.onboardingStatus;
        const getCountedEarnedCredits = (
          onboardingFreeCredits: OnboardingFreeCredits,
        ) =>
          getOnboardingEarnedCredits(
            getOnboardingCountedFreeCredits({
              onboardingFreeCredits,
              onboardingStatus,
            }),
          );
        const onboardingFreeCredits = { ...current, [step]: credits };
        const quietCreditsChange = isQuiet
          ? getCountedEarnedCredits(onboardingFreeCredits) -
            getCountedEarnedCredits(current)
          : 0;

        return {
          ...onboardingFreeCredits,
          seenCredits: Math.min(
            Math.max(0, current.seenCredits + quietCreditsChange),
            getOnboardingEarnedCredits(onboardingFreeCredits),
          ),
        };
      }),
    [setOnboardingFreeCredits, store],
  );
};
