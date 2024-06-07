import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { UserStateOnboardingStepValues } from '~/generated/graphql';

export const useSetOnboardingStep = () => {
  const setCurrentUser = useSetRecoilState(currentUserState);
  return useRecoilCallback(
    () => (onboardingStep: UserStateOnboardingStepValues | null) => {
      setCurrentUser(
        (current) =>
          ({
            ...current,
            state: { onboardingStep: onboardingStep },
          }) as any,
      );
    },
    [setCurrentUser],
  );
};
