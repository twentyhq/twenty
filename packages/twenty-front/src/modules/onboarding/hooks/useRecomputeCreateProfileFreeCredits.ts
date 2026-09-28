import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { getCreateProfileCreditsReward } from '@/onboarding/utils/getCreateProfileCreditsReward';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRecomputeCreateProfileFreeCredits = () => {
  const store = useStore();
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();

  return useCallback(
    () =>
      setOnboardingStepFreeCredits(
        'createProfile',
        getCreateProfileCreditsReward({
          currentUser: store.get(currentUserState.atom),
          currentWorkspaceMember: store.get(currentWorkspaceMemberState.atom),
          onboardingConfig: store.get(onboardingConfigState.atom),
        }),
      ),
    [setOnboardingStepFreeCredits, store],
  );
};
