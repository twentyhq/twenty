import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
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

const MONTHLY_PRICE = 25;
const YEARLY_PRICE = 19;

const StyledSubscriptionContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  margin: ${({ theme }) => theme.spacing(8)} 0 ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledPriceContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  margin: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)}
    0 ${({ theme }) => theme.spacing(4)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
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
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const StyledIntervalTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
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

  const price = selectedInterval === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
  const priceUnit =
    selectedInterval === 'monthly'
      ? t`seat / month`
      : t`seat / month - billed yearly`;

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
          message: t`Could not open Stripe. Please contact support.`,
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
      padding="none"
      isClosable
    >
      <Modal.Content isVerticalCentered>
        <Title noMarginTop>{t`Get Enterprise`}</Title>
        <SubTitle>{t`Enjoy a 30-day free trial`}</SubTitle>

        <StyledSubscriptionContainer>
          <StyledPriceContainer>
            <StyledPrice>{`$${price}`}</StyledPrice>
            <StyledPriceUnit>{priceUnit}</StyledPriceUnit>
          </StyledPriceContainer>
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
            <StyledIntervalTitle>
              {t`Monthly subscription`}
            </StyledIntervalTitle>
          </CardPicker>
          <CardPicker
            checked={selectedInterval === 'yearly'}
            handleChange={() => setSelectedInterval('yearly')}
          >
            <StyledIntervalTitle>
              {t`Yearly subscription`}
            </StyledIntervalTitle>
          </CardPicker>
        </StyledIntervalContainer>

        <MainButton
          title={t`Continue`}
          onClick={handleContinue}
          width={200}
          Icon={() => isLoading && <Loader />}
          disabled={isLoading}
        />
      </Modal.Content>
    </Modal>
  );
};
