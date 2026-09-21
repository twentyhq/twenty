import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';

export const useMarkBillingPaymentMethodAsAdded = () => {
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  // Stripe confirms the setup intent before the payment method webhook lands,
  // so the workspace billing state has to be updated client-side
  const markBillingPaymentMethodAsAdded = () => {
    setCurrentWorkspace((previousWorkspace) =>
      isDefined(previousWorkspace) &&
      isDefined(previousWorkspace.billingCustomer)
        ? {
            ...previousWorkspace,
            billingCustomer: {
              ...previousWorkspace.billingCustomer,
              hasPaymentMethod: true,
            },
          }
        : previousWorkspace,
    );
  };

  return { markBillingPaymentMethodAsAdded };
};
