import { BILLING_PLAN_LABELS } from '@/settings/billing/constants/BillingPlanLabels';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
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
  const { nextPlan } = useNextPlan();
  const nextPlanLabel = isDefined(nextPlan)
    ? t(BILLING_PLAN_LABELS[nextPlan.planKey])
    : undefined;

  const getSubtitle = () => {
    if (needsCreditCard) {
      return t`You will be redirected to add your credit card. Once added, your subscription will start automatically.`;
    }

    return isDefined(nextPlanLabel)
      ? t`Your trial ends and your ${nextPlanLabel} plan starts now. Do you want to proceed?`
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
