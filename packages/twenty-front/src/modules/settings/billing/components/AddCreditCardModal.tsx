import { AddPaymentMethodForm } from '@/settings/billing/components/AddPaymentMethodForm';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type AddCreditCardModalProps = {
  modalInstanceId: string;
  finalRedirectPath?: string;
  onPaymentMethodAdded: () => Promise<void>;
};

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

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
      <StyledCenteredTitle>
        <H1Title
          title={t`Add your credit card`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {t`Add your credit card below. Once added, your subscription will start automatically.`}
        </Section>
      </StyledSectionContainer>
      <AddPaymentMethodForm
        finalRedirectPath={finalRedirectPath}
        onPaymentMethodAdded={handlePaymentMethodAdded}
      />
      <StyledCancelButtonContainer>
        <Button
          onClick={() => closeModal(modalInstanceId)}
          variant="secondary"
          title={t`Cancel`}
          fullWidth
          justify="center"
        />
      </StyledCancelButtonContainer>
    </ModalStatefulWrapper>
  );
};
