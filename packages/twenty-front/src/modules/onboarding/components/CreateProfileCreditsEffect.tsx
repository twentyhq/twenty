import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { getCreateProfileCreditsReward } from '@/onboarding/utils/getCreateProfileCreditsReward';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';

export const CreateProfileCreditsEffect = () => {
  const store = useStore();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();

  useEffect(() => {
    setOnboardingStepFreeCredits(
      'createProfile',
      getCreateProfileCreditsReward({
        currentUser: store.get(currentUserState.atom),
        currentWorkspaceMember: store.get(currentWorkspaceMemberState.atom),
        onboardingConfig,
      }),
    );
  }, [onboardingConfig, setOnboardingStepFreeCredits, store]);

  return null;
};
