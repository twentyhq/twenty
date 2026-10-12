import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isSendInvoiceBillingSubscription } from '@/settings/billing/utils/isSendInvoiceBillingSubscription';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const billingHasPaymentMethodSelector = createAtomSelector({
  key: 'billingHasPaymentMethodSelector',
  get: ({ get }) => {
    const currentWorkspace = get(currentWorkspaceState);

    if (
      isSendInvoiceBillingSubscription(
        currentWorkspace?.currentBillingSubscription?.collectionMethod,
      )
    ) {
      return true;
    }

    return currentWorkspace?.billingCustomer?.hasPaymentMethod;
  },
});
