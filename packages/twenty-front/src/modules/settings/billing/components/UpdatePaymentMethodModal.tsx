import { AddPaymentMethodForm } from '@/settings/billing/components/AddPaymentMethodForm';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

type UpdatePaymentMethodModalProps = {
  modalInstanceId: string;
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

export const UpdatePaymentMethodModal = ({
  modalInstanceId,
}: UpdatePaymentMethodModalProps) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalInstanceId}
      isClosable
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
          title={t`Update your payment method`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {t`Add a card below to update your billing details and retry your payment.`}
        </Section>
      </StyledSectionContainer>
      <AddPaymentMethodForm
        onPaymentMethodAdded={async () => closeModal(modalInstanceId)}
        shouldStartSubscriptionAfterPaymentMethod={false}
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
