import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSetCurrentWorkspaceOnboardingFreeCredits = () => {
  const store = useStore();

  return useCallback(
    (
      onboardingFreeCredits:
        | OnboardingFreeCredits
        | ((current: OnboardingFreeCredits) => OnboardingFreeCredits),
    ) => {
      const currentWorkspace = store.get(currentWorkspaceState.atom);

      if (!isDefined(currentWorkspace)) {
        return;
      }

      store.set(
        onboardingFreeCreditsFamilyState.atomFamily(currentWorkspace.id),
        onboardingFreeCredits,
      );
    },
    [store],
  );
};
