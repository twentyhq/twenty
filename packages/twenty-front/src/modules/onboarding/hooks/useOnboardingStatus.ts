import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { type OnboardingStatus } from '~/generated-metadata/graphql';

export const useOnboardingStatus = (): OnboardingStatus | null | undefined => {
  const currentUser = useAtomValue(currentUserState);
  const isLoggedIn = useIsLogged();
  return isLoggedIn ? currentUser?.onboardingStatus : undefined;
};
