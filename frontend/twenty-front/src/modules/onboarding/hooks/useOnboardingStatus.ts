import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type OnboardingStatus } from '~/generated-metadata/graphql';

export const useOnboardingStatus = (): OnboardingStatus | null | undefined => {
  const currentUser = useAtomStateValue(currentUserState);
  const hasAccessTokenPair = useHasAccessTokenPair();
  return hasAccessTokenPair ? currentUser?.onboardingStatus : undefined;
};
