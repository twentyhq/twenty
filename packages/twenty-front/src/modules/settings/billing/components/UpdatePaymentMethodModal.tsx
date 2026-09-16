import { AddPaymentMethodForm } from '@/settings/billing/components/AddPaymentMethodForm';
import { useMarkBillingPaymentMethodAsAdded } from '@/settings/billing/hooks/useMarkBillingPaymentMethodAsAdded';
import { useWaitForPaymentRecovery } from '@/settings/billing/hooks/useWaitForPaymentRecovery';
import { isSubscriptionPaymentOverdue } from '@/settings/billing/utils/isSubscriptionPaymentOverdue';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
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
  const { closeModal } = useModal();
  const { enqueueToast } = useToast();
  const subscriptionStatus = useSubscriptionStatus();
  const { markBillingPaymentMethodAsAdded } =
    useMarkBillingPaymentMethodAsAdded();
  const { waitForPaymentRecovery } = useWaitForPaymentRecovery();

  const handlePaymentMethodAdded = async () => {
    closeModal(modalInstanceId);
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
          onClick={() => closeModal(modalInstanceId)}
          fullWidth
          variant="outline"
        >{t`Cancel`}</Button>
      </StyledCancelButtonContainer>
    </ModalStatefulWrapper>
  );
};
