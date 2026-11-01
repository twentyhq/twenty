import { AddPaymentMethodForm } from '@/settings/billing/components/AddPaymentMethodForm';
import { useMarkBillingPaymentMethodAsAdded } from '@/settings/billing/hooks/useMarkBillingPaymentMethodAsAdded';
import { useWaitForPaymentRecovery } from '@/settings/billing/hooks/useWaitForPaymentRecovery';
import { isSubscriptionPaymentOverdue } from '@/settings/billing/utils/isSubscriptionPaymentOverdue';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';

type UpdatePaymentMethodModalProps = {
  modalInstanceId: string;
};

export const UpdatePaymentMethodModal = ({
  modalInstanceId,
}: UpdatePaymentMethodModalProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const { enqueueToast } = useToast();
  const subscriptionStatus = useSubscriptionStatus();
  const { markBillingPaymentMethodAsAdded } =
    useMarkBillingPaymentMethodAsAdded();
  const { waitForPaymentRecovery } = useWaitForPaymentRecovery();

  const handlePaymentMethodAdded = async () => {
    closeDialog(modalInstanceId);
    markBillingPaymentMethodAsAdded();

    if (!isSubscriptionPaymentOverdue(subscriptionStatus)) {
      enqueueToast({ status: 'success', children: t`Payment method added.` });

      return;
    }

    enqueueToast({
      status: 'info',
      children: t`Payment method added. Retrying your payment...`,
    });

    await waitForPaymentRecovery();
  };

  return (
    <DialogInstance dialogId={modalInstanceId} dismissible renderInDocumentBody>
      {({ onKeyDown }) => (
        <Dialog.Popup
          onKeyDown={onKeyDown}
          size="md"
          data-globally-prevent-click-outside
        >
          <Dialog.Header>
            <Dialog.Title>{t`Update your payment method`}</Dialog.Title>
            <Dialog.Description>
              {t`Add a card below to update your billing details and retry your payment.`}
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            <AddPaymentMethodForm
              onPaymentMethodAdded={handlePaymentMethodAdded}
              shouldStartSubscriptionAfterPaymentMethod={false}
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
