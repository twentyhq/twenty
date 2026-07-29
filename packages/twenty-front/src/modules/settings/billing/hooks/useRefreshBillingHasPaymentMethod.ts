import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useLazyQuery } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { BillingHasPaymentMethodDocument } from '~/generated-metadata/graphql';

export const useRefreshBillingHasPaymentMethod = () => {
  const [fetchBillingHasPaymentMethod] = useLazyQuery(
    BillingHasPaymentMethodDocument,
    {
      fetchPolicy: 'network-only',
    },
  );
  const [, setCurrentWorkspace] = useAtomState(currentWorkspaceState);

  const refreshBillingHasPaymentMethod = useCallback(async () => {
    try {
      const { data } = await fetchBillingHasPaymentMethod();
      const hasPaymentMethod = data?.billingHasPaymentMethod;

      if (!isDefined(hasPaymentMethod)) {
        return;
      }

      setCurrentWorkspace((previousWorkspace) =>
        isDefined(previousWorkspace) &&
        isDefined(previousWorkspace.billingCustomer) &&
        previousWorkspace.billingCustomer.hasPaymentMethod !== hasPaymentMethod
          ? {
              ...previousWorkspace,
              billingCustomer: {
                ...previousWorkspace.billingCustomer,
                hasPaymentMethod,
              },
            }
          : previousWorkspace,
      );
    } catch {
      // A stale flag is tolerable; the backend re-verifies when the trial ends
    }
  }, [fetchBillingHasPaymentMethod, setCurrentWorkspace]);

  return { refreshBillingHasPaymentMethod };
};
