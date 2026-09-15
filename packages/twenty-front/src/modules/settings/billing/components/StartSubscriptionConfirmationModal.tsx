import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';

type StartSubscriptionConfirmationModalProps = {
  modalInstanceId: string;
  hasPaymentMethod: boolean | null | undefined;
  onConfirmClick: () => Promise<void>;
  loading: boolean;
};

export const StartSubscriptionConfirmationModal = ({
  modalInstanceId,
  hasPaymentMethod,
  onConfirmClick,
  loading,
}: StartSubscriptionConfirmationModalProps) => {
  const needsCreditCard = hasPaymentMethod === false;

  return (
    <ConfirmationModal
      modalInstanceId={modalInstanceId}
      title={
        needsCreditCard ? t`Add your credit card` : t`Start Your Subscription`
      }
      subtitle={
        needsCreditCard
          ? t`You will be redirected to add your credit card. Once added, your subscription will start automatically.`
          : t`We will activate your paid plan. Do you want to proceed?`
      }
      onConfirmClick={onConfirmClick}
      confirmButtonText={needsCreditCard ? t`Add credit card` : t`Confirm`}
      confirmButtonAccent="blue"
      loading={loading}
    />
  );
};
