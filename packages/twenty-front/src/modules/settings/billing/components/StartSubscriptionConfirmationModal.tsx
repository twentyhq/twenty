import { useTrialScheduledPlanLabel } from '@/settings/billing/hooks/useTrialScheduledPlanLabel';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

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
  const { trialScheduledPlanLabel } = useTrialScheduledPlanLabel();

  const getSubtitle = () => {
    if (isDefined(trialScheduledPlanLabel)) {
      return needsCreditCard
        ? t`You will be redirected to add your credit card. Once added, your trial ends and your ${trialScheduledPlanLabel} plan starts now.`
        : t`Your trial ends and your ${trialScheduledPlanLabel} plan starts now. Do you want to proceed?`;
    }

    return needsCreditCard
      ? t`You will be redirected to add your credit card. Once added, your subscription will start automatically.`
      : t`We will activate your paid plan. Do you want to proceed?`;
  };

  return (
    <ConfirmationDialog
      dialogId={modalInstanceId}
      title={
        needsCreditCard ? t`Add your credit card` : t`Start Your Subscription`
      }
      subtitle={getSubtitle()}
      onConfirmClick={onConfirmClick}
      confirmButtonText={needsCreditCard ? t`Add credit card` : t`Confirm`}
      confirmButtonColor="accent"
      loading={loading}
    />
  );
};
