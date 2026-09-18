import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { AddPaymentMethodForm } from '@/settings/billing/components/AddPaymentMethodForm';
import { useMarkBillingPaymentMethodAsAdded } from '@/settings/billing/hooks/useMarkBillingPaymentMethodAsAdded';
import { useWaitForPaymentRecovery } from '@/settings/billing/hooks/useWaitForPaymentRecovery';
import { isSubscriptionPaymentOverdue } from '@/settings/billing/utils/isSubscriptionPaymentOverdue';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { useToast } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type UpdatePaymentMethodModalProps = {
  modalInstanceId: string;
};

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledCancelButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

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
      enqueueToast({ variant: 'success', children: t`Payment method added.` });

      return;
    }

    enqueueToast({
      variant: 'info',
      children: t`Payment method added. Retrying your payment...`,
    });

    await waitForPaymentRecovery();
  };

  return (
    <DialogInstance dialogId={modalInstanceId} dismissible renderInDocumentBody>
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="md"
          data-globally-prevent-click-outside
          style={{
            padding: 'var(--t-spacing-6)',
            borderRadius: 'var(--t-spacing-1)',
          }}
        >
          <Dialog.Title>{t`Update your payment method`}</Dialog.Title>
          <StyledSectionContainer>
            <Section.Root align="center" color="primary">
              {t`Add a card below to update your billing details and retry your payment.`}
            </Section.Root>
          </StyledSectionContainer>
          <AddPaymentMethodForm
            onPaymentMethodAdded={handlePaymentMethodAdded}
            shouldStartSubscriptionAfterPaymentMethod={false}
          />
          <StyledCancelButtonContainer>
            <Button
              onClick={() => closeDialog(modalInstanceId)}
              fullWidth
              variant="outline"
            >{t`Cancel`}</Button>
          </StyledCancelButtonContainer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
