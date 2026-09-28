import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { getCreateProfileCreditsReward } from '@/onboarding/utils/getCreateProfileCreditsReward';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const CreateProfileCreditsEffect = () => {
  const store = useStore();
  const isOnboardingConfigLoaded = isDefined(
    useAtomStateValue(onboardingConfigState),
  );
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();

  useEffect(() => {
    setOnboardingStepFreeCredits(
      'createProfile',
      getCreateProfileCreditsReward({
        currentUser: store.get(currentUserState.atom),
        currentWorkspaceMember: store.get(currentWorkspaceMemberState.atom),
        onboardingConfig: store.get(onboardingConfigState.atom),
      }),
    );
  }, [isOnboardingConfigLoaded, setOnboardingStepFreeCredits, store]);

  return null;
};
