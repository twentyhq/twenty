import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isSendInvoiceBillingSubscription } from '@/settings/billing/utils/isSendInvoiceBillingSubscription';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const billingHasPaymentMethodSelector = createAtomSelector({
  key: 'billingHasPaymentMethodSelector',
  get: ({ get }) => {
    const currentWorkspace = get(currentWorkspaceState);

    // Invoice-paying customers pay each emailed invoice by bank transfer, so they never need a card on file
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
