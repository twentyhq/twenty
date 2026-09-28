import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingInviteTeamEmailsDraftState } from '@/onboarding/states/onboardingInviteTeamEmailsDraftState';
import { getInviteTeamCreditsReward } from '@/onboarding/utils/getInviteTeamCreditsReward';
import { getValidInviteEmails } from '@/onboarding/utils/getValidInviteEmails';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRecomputeInviteTeamFreeCredits = () => {
  const store = useStore();
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();

  return useCallback(
    () =>
      setOnboardingStepFreeCredits(
        'inviteTeam',
        getInviteTeamCreditsReward({
          invitedTeammatesCount: getValidInviteEmails(
            store.get(onboardingInviteTeamEmailsDraftState.atom) ?? [],
          ).length,
          onboardingConfig: store.get(onboardingConfigState.atom),
        }),
      ),
    [setOnboardingStepFreeCredits, store],
  );
};
