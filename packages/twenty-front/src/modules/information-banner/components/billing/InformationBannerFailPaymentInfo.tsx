import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { UpdatePaymentMethodModal } from '@/settings/billing/components/UpdatePaymentMethodModal';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { t } from '@lingui/core/macro';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const FAILED_PAYMENT_UPDATE_PAYMENT_MODAL_ID =
  'failed-payment-update-payment-modal';

export const InformationBannerFailPaymentInfo = () => {
  const { openModal } = useModal();

  const { [PermissionFlagType.BILLING]: hasPermissionToUpdateBillingDetails } =
    usePermissionFlagMap();

  return (
    <>
      <InformationBanner
        componentInstanceId="information-banner-fail-payment-info"
        color="danger"
        variant="secondary"
        message={
          hasPermissionToUpdateBillingDetails
            ? t`A payment method is needed to keep your workspace active.`
            : t`A payment method is needed. Please contact your admin.`
        }
        buttonTitle={
          hasPermissionToUpdateBillingDetails
            ? t`Add payment method`
            : undefined
        }
        buttonOnClick={() => openModal(FAILED_PAYMENT_UPDATE_PAYMENT_MODAL_ID)}
      />
      {hasPermissionToUpdateBillingDetails && (
        <UpdatePaymentMethodModal
          modalInstanceId={FAILED_PAYMENT_UPDATE_PAYMENT_MODAL_ID}
        />
      )}
    </>
  );
};
