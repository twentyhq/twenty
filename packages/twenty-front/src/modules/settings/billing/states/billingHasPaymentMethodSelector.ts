import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const billingHasPaymentMethodSelector = createAtomSelector({
  key: 'billingHasPaymentMethodSelector',
  get: ({ get }) =>
    get(currentWorkspaceState)?.billingCustomer?.hasPaymentMethod,
});
