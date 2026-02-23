import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { type SubscriptionStatus } from '~/generated-metadata/graphql';

export const useSubscriptionStatus = (): SubscriptionStatus | undefined => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  return currentWorkspace?.currentBillingSubscription?.status;
};
