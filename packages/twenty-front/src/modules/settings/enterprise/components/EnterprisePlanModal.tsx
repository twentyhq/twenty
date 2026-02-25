import { SubscriptionBenefit } from '@/billing/components/SubscriptionBenefit';
import { ENTERPRISE_CHECKOUT_SESSION } from '@/settings/enterprise/graphql/queries/enterpriseCheckoutSession';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLazyQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Loader } from 'twenty-ui/feedback';
import { CardPicker, MainButton } from 'twenty-ui/input';

export const ENTERPRISE_PLAN_MODAL_ID = 'enterprise-plan-modal';

type BillingInterval = 'monthly' | 'yearly';

const StyledTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
  text-align: center;
`;

const StyledSubtitle = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin: ${({ theme }) => theme.spacing(2)} 0 0;
  text-align: center;
`;

const StyledPriceContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledPrice = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledPriceUnit = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSubscriptionContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  margin: ${({ theme }) => theme.spacing(6)} 0
    ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledBenefitsContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledIntervalContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

const StyledIntervalCardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledIntervalTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export const EnterprisePlanModal = () => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [selectedInterval, setSelectedInterval] =
    useState<BillingInterval>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const [fetchCheckoutSession] = useLazyQuery(ENTERPRISE_CHECKOUT_SESSION);

  const benefits = [
    t`SSO (SAML / OIDC)`,
    t`Row-level security`,
    t`Audit logs`,
    t`Custom objects`,
    t`API & Webhooks`,
  ];

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      const { data } = await fetchCheckoutSession({
        variables: { billingInterval: selectedInterval },
      });

      const checkoutUrl = data?.enterpriseCheckoutSession;

      if (checkoutUrl !== null && checkoutUrl !== undefined) {
        window.open(checkoutUrl, '_blank', 'noopener');
        closeModal(ENTERPRISE_PLAN_MODAL_ID);
      } else {
        enqueueErrorSnackBar({
          message: t`Could not open Stripe. Please try again.`,
        });
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Error opening Stripe`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      modalId={ENTERPRISE_PLAN_MODAL_ID}
      size="small"
      padding="large"
      isClosable
    >
      <Modal.Content isVerticalCentered>
        <StyledTitle>{t`Get Enterprise`}</StyledTitle>
        <StyledSubtitle>{t`Enjoy a 30-day free trial`}</StyledSubtitle>

        <StyledPriceContainer>
          <StyledPrice>
            {selectedInterval === 'monthly' ? '$25' : '$19'}
          </StyledPrice>
          <StyledPriceUnit>
            {selectedInterval === 'monthly'
              ? t`seat / month`
              : t`seat / month - billed yearly`}
          </StyledPriceUnit>
        </StyledPriceContainer>

        <StyledSubscriptionContainer>
          <StyledBenefitsContainer>
            {benefits.map((benefit) => (
              <SubscriptionBenefit key={benefit}>{benefit}</SubscriptionBenefit>
            ))}
          </StyledBenefitsContainer>
        </StyledSubscriptionContainer>

        <StyledIntervalContainer>
          <CardPicker
            checked={selectedInterval === 'monthly'}
            handleChange={() => setSelectedInterval('monthly')}
          >
            <StyledIntervalCardContent>
              <StyledIntervalTitle>
                {t`Monthly subscription`}
              </StyledIntervalTitle>
            </StyledIntervalCardContent>
          </CardPicker>
          <CardPicker
            checked={selectedInterval === 'yearly'}
            handleChange={() => setSelectedInterval('yearly')}
          >
            <StyledIntervalCardContent>
              <StyledIntervalTitle>
                {t`Yearly subscription`}
              </StyledIntervalTitle>
            </StyledIntervalCardContent>
          </CardPicker>
        </StyledIntervalContainer>

        <StyledButtonContainer>
          <MainButton
            title={t`Continue`}
            onClick={handleContinue}
            width={200}
            Icon={() => isLoading && <Loader />}
            disabled={isLoading}
          />
        </StyledButtonContainer>
      </Modal.Content>
    </Modal>
  );
};
