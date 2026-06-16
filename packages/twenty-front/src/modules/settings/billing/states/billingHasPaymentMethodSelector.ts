import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

// Maintained by Stripe payment method webhooks; null/undefined means
// unknown, in which case callers fall back to the default copy.
export const billingHasPaymentMethodSelector = createAtomSelector({
  key: 'billingHasPaymentMethodSelector',
  get: ({ get }) =>
    get(currentWorkspaceState)?.billingCustomer?.hasPaymentMethod,
});
