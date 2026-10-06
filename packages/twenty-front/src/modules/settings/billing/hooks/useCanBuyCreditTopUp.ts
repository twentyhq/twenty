import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isImpersonatingState } from '@/auth/states/isImpersonatingState';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import {
  PermissionFlagType,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

// Mirrors the purchaseCreditTopUp guards, so the button never leads to a refusal
export const useCanBuyCreditTopUp = () => {
  const hasBillingPermission = useHasPermissionFlag(PermissionFlagType.BILLING);
  const isImpersonating = useAtomStateValue(isImpersonatingState);
  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );
  const currentBillingSubscription = useAtomStateValue(
    currentWorkspaceState,
  )?.currentBillingSubscription;

  return (
    hasBillingPermission &&
    !isImpersonating &&
    billingHasPaymentMethod !== false &&
    currentBillingSubscription?.status === SubscriptionStatus.Active &&
    !isDefined(currentBillingSubscription.cancelAt)
  );
};
