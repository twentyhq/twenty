import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { type SubscriptionStatus } from '~/generated-metadata/graphql';

export const useSubscriptionStatus = (): SubscriptionStatus | undefined => {
  const currentWorkspace = useAtomValue(currentWorkspaceState);
  return currentWorkspace?.currentBillingSubscription?.status;
};
