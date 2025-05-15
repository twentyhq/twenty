import React, { useState } from 'react';

import { Title } from '@/auth/components/Title';
import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { MainButton } from 'twenty-ui/input';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useRecoilState } from 'recoil';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { selectedPlanState } from '~/pages/onboarding/Plans';
import { z } from 'zod';
import {
  REACT_APP_STRIPE_PUBLISHABLE_KEY,
  REACT_APP_SERVER_BASE_URL,
} from '~/config';

const paymentOptions = [
  {
    id: 1,
    title: 'Stripe',
    payment: 'Cartão de crédito',
  },
  {
    id: 2,
    title: 'Inter',
    payment: 'Boleto',
  },
];

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

const StyledPlanLabel = styled.label`
  cursor: pointer;
  position: relative;
`;

const StyledPlanRadio = styled.input`
  display: none;
`;

const StyledPlanOptionContainer = styled.div<{ selected: boolean }>`
  background-color: ${({ theme }) => theme.color.gray};
  border: 2px solid ${({ theme }) => theme.color.gray40};
  border-radius: 8px;
  padding: 1rem;
  transition: 0.2s;
  width: 20rem;
`;

const StyledIndicator = styled.div<{ selected: boolean }>`
  background-color: ${({ selected, theme }) =>
    selected ? theme.color.blue50 : 'transparent'};
  border: 2px solid ${({ theme }) => theme.color.gray30};
  border-radius: 50%;
  position: absolute;
  right: 10px;
  top: 10px;
  width: 16px;
  height: 16px;
`;

const StyledPayment = styled.div`
  color: ${({ theme }) => theme.color.gray70};
  font-size: 1.5rem;
  font-weight: bold;
  span {
    color: ${({ theme }) => theme.color.gray60};
    font-size: 0.9rem;
    font-weight: normal;
  }
`;

const StyledPlanTitle = styled.h3`
  color: ${({ theme }) => theme.color.gray60};
  margin: 0;
  padding-bottom: 5px;
  font-size: 12px;
`;

const StyledFooterContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: center;
  width: 100%;

  p {
    color: ${({ theme }) => theme.color.gray50};
    font-size: 0.8rem;
  }
`;

export const PaymentOptions = () => {
  const { t } = useLingui();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { enqueueSnackBar } = useSnackBar();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(1);

  const paymentSchema = z.object({
    paymentId: z.number().min(1, 'select a valid payment method'),
  });

  // eslint-disable-next-line @nx/workspace-matching-state-variable
  const [selectedPlanId] = useRecoilState(selectedPlanState);

  console.log('plano em payment', selectedPlanId);

  console.log('price', selectedPlanId.price);

  const stripePaymentMethod = async () => {
    const response = await fetch(
      `${REACT_APP_SERVER_BASE_URL}/stripe/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPlanId.price,
          currency: 'brl',
          success_url: `${window.location.origin}/payment-required/payment-success`,
          cancel_url: `${window.location.origin}/plan-required`,
        }),
      },
    );

    const { id } = await response.json();

    if (!REACT_APP_STRIPE_PUBLISHABLE_KEY)
      throw new Error('App missing Stripe environment configuration.');

    const { loadStripe } = await import('@stripe/stripe-js');
    const stripe = await loadStripe(REACT_APP_STRIPE_PUBLISHABLE_KEY);

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId: id });
    } else {
      throw new Error('Stripe failed to load');
    }
  };

  const interPaymentMethod = async () => {
    enqueueSnackBar('Comming Soon', {
      variant: SnackBarVariant.Info,
    });
  };

  const onSubmit = async () => {
    try {
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }

      const validatePaymentMethod = paymentSchema.parse({
        paymentId: selectedPaymentMethod,
      });

      if (!validatePaymentMethod) {
        enqueueSnackBar('Select a valid payment method', {
          variant: SnackBarVariant.Error,
        });
        return;
      }

      const selectedPayment = paymentOptions.find(
        (p) => p.id === selectedPaymentMethod,
      );

      if (selectedPayment?.title === 'Stripe') {
        await stripePaymentMethod();
      }

      if (selectedPayment?.title === 'Inter') {
        await interPaymentMethod();
      }
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <Modal size="large" className="custom-modal">
      <style>{`
        .custom-modal {
          width: 70% !important;
        }
      `}</style>

      <Modal.Content isVerticalCentered isHorizontalCentered>
        <Title>
          <Trans>Choose your payment method</Trans>
        </Title>

        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          {paymentOptions.map((payment) => (
            <StyledPlanLabel key={payment.id}>
              <StyledPlanRadio
                type="radio"
                name="payment"
                value={payment.id}
                checked={selectedPaymentMethod === payment.id}
                onChange={() => setSelectedPaymentMethod(payment.id)}
              />
              <StyledPlanOptionContainer
                selected={selectedPaymentMethod === payment.id}
              >
                <StyledIndicator
                  selected={selectedPaymentMethod === payment.id}
                />

                <StyledPlanTitle>{payment.title}</StyledPlanTitle>
                <StyledPayment>{payment.payment}</StyledPayment>
              </StyledPlanOptionContainer>
            </StyledPlanLabel>
          ))}
        </div>

        <StyledButtonContainer>
          <MainButton
            title={t`Continue`}
            variant="primary"
            onClick={() => onSubmit()}
            disabled={false}
            fullWidth
          />
        </StyledButtonContainer>

        <StyledFooterContainer>
          <p>Log out</p>
          <p>.</p>
          <p>Book a Call</p>
        </StyledFooterContainer>
      </Modal.Content>
    </Modal>
  );
};
