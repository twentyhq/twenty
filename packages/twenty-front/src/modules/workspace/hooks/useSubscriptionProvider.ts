import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { BillingPaymentProviders } from '~/generated/graphql';

export const useSubscriptioProvider = ():
  | BillingPaymentProviders
  | undefined => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return currentWorkspace?.currentBillingSubscription?.provider;
};
