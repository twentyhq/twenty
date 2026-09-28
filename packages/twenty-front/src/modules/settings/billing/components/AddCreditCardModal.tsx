import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { AddPaymentMethodForm } from '@/settings/billing/components/AddPaymentMethodForm';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

type AddCreditCardModalProps = {
  modalInstanceId: string;
  finalRedirectPath?: string;
  onPaymentMethodAdded: () => Promise<void>;
};

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledCancelButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

export const AddCreditCardModal = ({
  modalInstanceId,
  finalRedirectPath,
  onPaymentMethodAdded,
}: AddCreditCardModalProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();

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
          <Dialog.Title>{t`Add your credit card`}</Dialog.Title>
          <StyledSectionContainer>
            <Section.Root align="center" color="primary">
              {t`Add your credit card below. Once added, your subscription will start automatically.`}
            </Section.Root>
          </StyledSectionContainer>
          <AddPaymentMethodForm
            finalRedirectPath={finalRedirectPath}
            onPaymentMethodAdded={handlePaymentMethodAdded}
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
