import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { AddPaymentMethodForm } from '@/settings/billing/components/AddPaymentMethodForm';
import { BILLING_PLAN_LABELS } from '@/settings/billing/constants/BillingPlanLabels';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { Button } from 'twenty-ui/primitives/input';

type AddCreditCardModalProps = {
  modalInstanceId: string;
  finalRedirectPath?: string;
  onPaymentMethodAdded: () => Promise<void>;
};

export const AddCreditCardModal = ({
  modalInstanceId,
  finalRedirectPath,
  onPaymentMethodAdded,
}: AddCreditCardModalProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const { nextPlan } = useNextPlan();
  const nextPlanLabel = isDefined(nextPlan)
    ? t(BILLING_PLAN_LABELS[nextPlan.planKey])
    : undefined;

  // Close only after activation so the form keeps its loading state visible
  const handlePaymentMethodAdded = async () => {
    await onPaymentMethodAdded();
    closeDialog(modalInstanceId);
  };

  return (
    <DialogInstance
      dialogId={modalInstanceId}
      dismissible={true}
      renderInDocumentBody
    >
      {({ onKeyDown }) => (
        <Dialog.Popup
          onKeyDown={onKeyDown}
          size="md"
          data-globally-prevent-click-outside
        >
          <Dialog.Header>
            <Dialog.Title>{t`Add your credit card`}</Dialog.Title>
            <Dialog.Description>
              {isDefined(nextPlanLabel)
                ? t`Add your credit card below. Once added, your trial ends and your ${nextPlanLabel} plan starts now.`
                : t`Add your credit card below. Once added, your subscription will start automatically.`}
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            <AddPaymentMethodForm
              finalRedirectPath={finalRedirectPath}
              onPaymentMethodAdded={handlePaymentMethodAdded}
            />
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              onClick={() => closeDialog(modalInstanceId)}
              fullWidth
              variant="outline"
            >{t`Cancel`}</Button>
          </Dialog.Footer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
