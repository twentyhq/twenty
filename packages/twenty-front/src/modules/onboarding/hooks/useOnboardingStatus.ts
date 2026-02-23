import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { type OnboardingStatus } from '~/generated-metadata/graphql';

export const useOnboardingStatus = (): OnboardingStatus | null | undefined => {
  const currentUser = useRecoilValueV2(currentUserState);
  const isLoggedIn = useIsLogged();
  return isLoggedIn ? currentUser?.onboardingStatus : undefined;
};
