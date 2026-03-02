import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type OnboardingStatus } from '~/generated-metadata/graphql';

export const useOnboardingStatus = (): OnboardingStatus | null | undefined => {
  const currentUser = useAtomStateValue(currentUserState);
  const isLoggedIn = useIsLogged();
  return isLoggedIn ? currentUser?.onboardingStatus : undefined;
};
