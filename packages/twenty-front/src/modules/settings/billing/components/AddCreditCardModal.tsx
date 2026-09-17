import { AddPaymentMethodForm } from '@/settings/billing/components/AddPaymentMethodForm';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  const { closeModal } = useModal();

  // Close only after activation so the form keeps its loading state visible
  const handlePaymentMethodAdded = async () => {
    await onPaymentMethodAdded();
    closeModal(modalInstanceId);
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalInstanceId}
      isClosable={true}
      size="medium"
      padding="large"
      overlay="dark"
      dataGloballyPreventClickOutside
      renderInDocumentBody
      smallBorderRadius
      autoHeight
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
          onClick={() => closeModal(modalInstanceId)}
          fullWidth
          variant="outline"
        >{t`Cancel`}</Button>
      </StyledCancelButtonContainer>
    </ModalStatefulWrapper>
  );
};
