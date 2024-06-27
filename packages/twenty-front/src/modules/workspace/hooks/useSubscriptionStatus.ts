import { useRecoilValue } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { SubscriptionStatus } from '~/generated/graphql';

export const useSubscriptionStatus = ():
  | SubscriptionStatus
  | null
  | undefined => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const billing = useRecoilValue(billingState);
  const isLoggedIn = useIsLogged();
  if (!isLoggedIn) {
    return undefined;
  }
  if (!billing?.isBillingEnabled) {
    return SubscriptionStatus.Active;
  }
  return (
    currentWorkspace?.currentBillingSubscription?.status ||
    SubscriptionStatus.Incomplete
  );
};
