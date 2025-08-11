import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type SubscriptionStatus } from '~/generated/graphql';

export const useSubscriptionStatus = (): SubscriptionStatus | undefined => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  return currentWorkspace?.currentBillingSubscription?.status;
};
