import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type SubscriptionStatus } from '~/generated-metadata/graphql';

export const useSubscriptionStatus = (): SubscriptionStatus | undefined => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  return currentWorkspace?.currentBillingSubscription?.status;
};
