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
