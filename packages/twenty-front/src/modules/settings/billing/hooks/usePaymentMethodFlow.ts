import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const usePaymentMethodFlow = (modalInstanceId: string) => {
  const { openDialog } = useDialog();

  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );

  const hasPermissionToManageBilling = useHasPermissionFlag(
    PermissionFlagType.BILLING,
  );

  const { isBillingPortalSessionDisabled, openBillingPortal } =
    useBillingPortalSession(getSettingsPath(SettingsPath.Billing));

  // The in-product form only handles adding the first payment method; the rest needs the billing portal
  const shouldAddPaymentMethodInProduct =
    hasPermissionToManageBilling && billingHasPaymentMethod === false;

  const openPaymentMethodFlow = () => {
    if (shouldAddPaymentMethodInProduct) {
      openDialog(modalInstanceId);
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
