import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { UpdatePaymentMethodModal } from '@/settings/billing/components/UpdatePaymentMethodModal';
import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const FAILED_PAYMENT_UPDATE_PAYMENT_MODAL_ID =
  'failed-payment-update-payment-modal';

export const InformationBannerFailPaymentInfo = () => {
  const { openModal } = useModal();
  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );
  const { isBillingPortalSessionDisabled, openBillingPortal } =
    useBillingPortalSession(getSettingsPath(SettingsPath.Billing));

  const { [PermissionFlagType.BILLING]: hasPermissionToUpdateBillingDetails } =
    usePermissionFlagMap();

  const shouldAddPaymentMethodInProduct = billingHasPaymentMethod === false;

  const handlePaymentAction = () => {
    if (shouldAddPaymentMethodInProduct) {
      openModal(FAILED_PAYMENT_UPDATE_PAYMENT_MODAL_ID);
      return;
    }

    openBillingPortal();
  };

  return (
    <>
      <InformationBanner
        componentInstanceId="information-banner-fail-payment-info"
        color="danger"
        variant="secondary"
        message={
          hasPermissionToUpdateBillingDetails
            ? shouldAddPaymentMethodInProduct
              ? t`A payment method is needed to keep your workspace active.`
              : t`Last payment failed. Please update your billing details.`
            : t`There is a billing issue. Please contact your admin.`
        }
        buttonTitle={
          hasPermissionToUpdateBillingDetails
            ? shouldAddPaymentMethodInProduct
              ? t`Add payment method`
              : t`Update payment`
            : undefined
        }
        buttonOnClick={handlePaymentAction}
        isButtonDisabled={
          !shouldAddPaymentMethodInProduct && isBillingPortalSessionDisabled
        }
      />
      {hasPermissionToUpdateBillingDetails &&
        shouldAddPaymentMethodInProduct && (
          <UpdatePaymentMethodModal
            modalInstanceId={FAILED_PAYMENT_UPDATE_PAYMENT_MODAL_ID}
          />
        )}
    </>
  );
};
