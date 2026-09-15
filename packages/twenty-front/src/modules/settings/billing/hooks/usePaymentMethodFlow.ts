import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const usePaymentMethodFlow = (modalInstanceId: string) => {
  const { openModal } = useModal();

  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );

  const { [PermissionFlagType.BILLING]: hasPermissionToManageBilling } =
    usePermissionFlagMap();

  const { isBillingPortalSessionDisabled, openBillingPortal } =
    useBillingPortalSession(getSettingsPath(SettingsPath.Billing));

  // Adding the first payment method is the only flow the in-product form can
  // handle, everything else needs the billing portal
  const shouldAddPaymentMethodInProduct =
    hasPermissionToManageBilling && billingHasPaymentMethod === false;

  const openPaymentMethodFlow = () => {
    if (shouldAddPaymentMethodInProduct) {
      openModal(modalInstanceId);
      return;
    }

    openBillingPortal();
  };

  const isPaymentMethodFlowDisabled =
    !shouldAddPaymentMethodInProduct && isBillingPortalSessionDisabled;

  return {
    hasPermissionToManageBilling,
    shouldAddPaymentMethodInProduct,
    openPaymentMethodFlow,
    isPaymentMethodFlowDisabled,
    isBillingPortalSessionDisabled,
    openBillingPortal,
  };
};
