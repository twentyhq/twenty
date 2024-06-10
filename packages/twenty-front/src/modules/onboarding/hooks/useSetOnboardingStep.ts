import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingStep } from '~/generated/graphql';

export const useSetOnboardingStep = () => {
  const setCurrentUser = useSetRecoilState(currentUserState);
  return useRecoilCallback(
    () => (onboardingStep: OnboardingStep | null) => {
      setCurrentUser(
        (current) =>
          ({
            ...current,
            onboardingStep,
          }) as any,
      );
    },
    [setCurrentUser],
  );
};
