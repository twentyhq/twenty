import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { selector } from 'recoil';
import { SubscriptionStatus } from '../../../generated/graphql';

export const subscriptionStatusState = selector<SubscriptionStatus | null>({
  key: 'subscriptionStatusState',
  get: ({ get }) => {
    const currentWorkspace = get(currentWorkspaceState);

    return currentWorkspace?.currentBillingSubscription?.status ?? null;
  },
});
