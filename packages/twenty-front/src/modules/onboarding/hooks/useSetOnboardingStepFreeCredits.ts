import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { getOnboardingEarnedCredits } from '@/onboarding/utils/getOnboardingEarnedCredits';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useCallback } from 'react';

type SetOnboardingStepFreeCreditsOptions = {
  isQuiet?: boolean;
};

export const useSetOnboardingStepFreeCredits = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const setOnboardingFreeCredits = useSetAtomFamilyState(
    onboardingFreeCreditsFamilyState,
    currentWorkspace?.id ?? '',
  );

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
