import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { UpdatePaymentMethodModal } from '@/settings/billing/components/UpdatePaymentMethodModal';
import { usePaymentMethodFlow } from '@/settings/billing/hooks/usePaymentMethodFlow';
import { t } from '@lingui/core/macro';

const FAILED_PAYMENT_UPDATE_PAYMENT_MODAL_ID =
  'failed-payment-update-payment-modal';

export const InformationBannerFailPaymentInfo = () => {
  const {
    hasPermissionToManageBilling: hasPermissionToUpdateBillingDetails,
    shouldAddPaymentMethodInProduct,
    openPaymentMethodFlow,
    isPaymentMethodFlowDisabled,
  } = usePaymentMethodFlow(FAILED_PAYMENT_UPDATE_PAYMENT_MODAL_ID);

  const getMessage = () => {
    if (!hasPermissionToUpdateBillingDetails) {
      return t`There is a billing issue. Please contact your admin.`;
    }

    if (shouldAddPaymentMethodInProduct) {
      return t`A payment method is needed to keep your workspace active.`;
    }

    return t`Last payment failed. Please update your billing details.`;
  };

  const getButtonTitle = () => {
    if (!hasPermissionToUpdateBillingDetails) {
      return undefined;
    }

    return shouldAddPaymentMethodInProduct
      ? t`Add payment method`
      : t`Update payment`;
  };

  return (
    <>
      <InformationBanner
        componentInstanceId="information-banner-fail-payment-info"
        color="danger"
        variant="secondary"
        message={getMessage()}
        buttonTitle={getButtonTitle()}
        buttonOnClick={openPaymentMethodFlow}
        isButtonDisabled={isPaymentMethodFlowDisabled}
      />
      {shouldAddPaymentMethodInProduct && (
        <UpdatePaymentMethodModal
          modalInstanceId={FAILED_PAYMENT_UPDATE_PAYMENT_MODAL_ID}
        />
      )}
    </>
  );
};
