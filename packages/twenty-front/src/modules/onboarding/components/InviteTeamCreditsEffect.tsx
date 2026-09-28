import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingInviteTeamEmailsDraftState } from '@/onboarding/states/onboardingInviteTeamEmailsDraftState';
import { getInviteTeamCreditsReward } from '@/onboarding/utils/getInviteTeamCreditsReward';
import { getValidInviteEmails } from '@/onboarding/utils/getValidInviteEmails';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';

export const InviteTeamCreditsEffect = () => {
  const store = useStore();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();

  useEffect(() => {
    setOnboardingStepFreeCredits(
      'inviteTeam',
      getInviteTeamCreditsReward({
        invitedTeammatesCount: getValidInviteEmails(
          store.get(onboardingInviteTeamEmailsDraftState.atom) ?? [],
        ).length,
        onboardingConfig,
      }),
    );
  }, [onboardingConfig, setOnboardingStepFreeCredits, store]);

  return null;
};
