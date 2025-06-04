import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { CardPicker } from 'twenty-ui/input';

import { SubTitle } from '@/auth/components/SubTitle';
import { SubscriptionBenefit } from '@/billing/components/SubscriptionBenefit';
import { SubscriptionPrice } from '@/billing/components/SubscriptionPrice';
import { TrialCard } from '@/billing/components/TrialCard';

import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { billingState } from '@/client-config/states/billingState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  BillingPriceLicensedDto,
  SubscriptionInterval,
} from '~/generated/graphql';

const StyledSubscriptionContainer = styled.div<{
  withLongerMarginBottom: boolean;
}>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme, withLongerMarginBottom }) =>
    withLongerMarginBottom ? theme.spacing(1) : theme.spacing(6)};
  width: 100%;
`;

const StyledSubscriptionPriceContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  margin: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)}
    0 ${({ theme }) => theme.spacing(4)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledBenefitsContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
`;

const StyledChooseTrialContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

type OnboardingPlanCardProps = {
  benefits: string[];
  planName?: string;
  productPrice?: BillingPriceLicensedDto;
  withCreditCardTrialPeriod?: boolean;
  withCreditCardTrialPeriodDuration?: number;
  hasWithoutCreditCardTrialPeriod?: boolean;
};

export const OnboardingPlanCard = ({
  benefits,
  productPrice,
  planName,
  withCreditCardTrialPeriod = false,
  withCreditCardTrialPeriodDuration,
  hasWithoutCreditCardTrialPeriod = false,
}: OnboardingPlanCardProps) => {
  const [billingCheckoutSession, setBillingCheckoutSession] = useRecoilState(
    billingCheckoutSessionState,
  );

  const billing = useRecoilValue(billingState);

  const handleTrialPeriodChange = (withCreditCard: boolean) => {
    return () => {
      if (
        isDefined(productPrice) &&
        billingCheckoutSession.requirePaymentMethod !== withCreditCard
      ) {
        setBillingCheckoutSession({
          ...billingCheckoutSession,
          interval: productPrice.recurringInterval,
          requirePaymentMethod: withCreditCard,
        });
      }
    };
  };

  return (
    <>
      {withCreditCardTrialPeriod && (
        <SubTitle>
          {t`Enjoy a ${withCreditCardTrialPeriodDuration}-days free trial`}
        </SubTitle>
      )}
      <StyledSubscriptionContainer
        withLongerMarginBottom={!hasWithoutCreditCardTrialPeriod}
      >
        <StyledSubscriptionPriceContainer>
          <SubTitle>{planName}</SubTitle>
          <SubscriptionPrice
            type={productPrice?.recurringInterval || SubscriptionInterval.Month}
            price={(productPrice?.unitAmount || 0) / 100}
          />
        </StyledSubscriptionPriceContainer>
        <StyledBenefitsContainer>
          {benefits.map((benefit) => (
            <SubscriptionBenefit key={benefit}>{benefit}</SubscriptionBenefit>
          ))}
        </StyledBenefitsContainer>
      </StyledSubscriptionContainer>
      {hasWithoutCreditCardTrialPeriod && (
        <StyledChooseTrialContainer>
          {billing?.trialPeriods.map((trialPeriod) => (
            <CardPicker
              checked={
                billingCheckoutSession.requirePaymentMethod ===
                trialPeriod.isCreditCardRequired
              }
              handleChange={handleTrialPeriodChange(
                trialPeriod.isCreditCardRequired,
              )}
              key={`trial-period-${trialPeriod.duration}`}
              name="trial-period"
            >
              <TrialCard
                duration={trialPeriod.duration}
                withCreditCard={trialPeriod.isCreditCardRequired}
              />
            </CardPicker>
          ))}
        </StyledChooseTrialContainer>
      )}
    </>
  );
};
