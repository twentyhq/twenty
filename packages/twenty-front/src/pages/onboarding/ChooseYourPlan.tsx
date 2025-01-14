import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { SubscriptionBenefit } from '@/billing/components/SubscriptionBenefit';
import { SubscriptionPrice } from '@/billing/components/SubscriptionPrice';
import { TrialCard } from '@/billing/components/TrialCard';
import { useHandleCheckoutSession } from '@/billing/hooks/useHandleCheckoutSession';
import { billingState } from '@/client-config/states/billingState';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  ActionLink,
  CAL_LINK,
  CardPicker,
  isDefined,
  Loader,
  MainButton,
} from 'twenty-ui';
import { SubscriptionInterval } from '~/generated-metadata/graphql';
import { useGetProductPricesQuery } from '~/generated/graphql';

const StyledSubscriptionContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};

  display: flex;
  flex-direction: column;
  margin: ${({ theme }) => theme.spacing(8)} 0
    ${({ theme }) => theme.spacing(2)};
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

const StyledLinkGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(4)};

  > span {
    background-color: ${({ theme }) => theme.font.color.light};
    border-radius: 50%;
    height: 2px;
    width: 2px;
  }
`;

const StyledMainButton = styled(MainButton)<{
  withMarginTop: boolean;
}>`
  .ContinueButton {
    ${({ withMarginTop, theme }) =>
      withMarginTop &&
      css`
        margin-top: ${theme.spacing(4)};
      `}
  }
`;

const benefits = [
  'Full access',
  'Unlimited contacts',
  'Email integration',
  'Custom objects',
  'API & Webhooks',
  '1 000 workflow node executions',
];
export const ChooseYourPlan = () => {
  const billing = useRecoilValue(billingState);

  const { data: prices } = useGetProductPricesQuery({
    variables: { product: 'base-plan' },
  });

  const price = prices?.getProductPrices?.productPrices.find(
    (productPrice) =>
      productPrice.recurringInterval === SubscriptionInterval.Month,
  );

  const hasWithoutCreditCardTrialPeriod = billing?.trialPeriods.some(
    (trialPeriod) =>
      !trialPeriod.isCreditCardRequired && trialPeriod.duration !== 0,
  );
  const withCreditCardTrialPeriod = billing?.trialPeriods.find(
    (trialPeriod) => trialPeriod.isCreditCardRequired,
  );

  const [billingCheckoutSession, setBillingCheckoutSession] = useRecoilState(
    billingCheckoutSessionState,
  );

  const { handleCheckoutSession, isSubmitting } = useHandleCheckoutSession({
    recurringInterval: billingCheckoutSession.interval,
    plan: billingCheckoutSession.plan,
    requirePaymentMethod: billingCheckoutSession.requirePaymentMethod,
  });

  const handleTrialPeriodChange = (withCreditCard: boolean) => {
    return () => {
      if (
        isDefined(price) &&
        billingCheckoutSession.requirePaymentMethod !== withCreditCard
      ) {
        setBillingCheckoutSession({
          plan: billingCheckoutSession.plan,
          interval: price.recurringInterval,
          requirePaymentMethod: withCreditCard,
        });
      }
    };
  };

  const { signOut } = useAuth();

  return (
    isDefined(price) &&
    isDefined(billing) && (
      <>
        <Title noMarginTop>
          {hasWithoutCreditCardTrialPeriod
            ? 'Choose your Trial'
            : 'Get your subscription'}
        </Title>
        {hasWithoutCreditCardTrialPeriod ? (
          <SubTitle>Cancel anytime</SubTitle>
        ) : (
          withCreditCardTrialPeriod && (
            <SubTitle>{`Enjoy a ${withCreditCardTrialPeriod.duration}-free trial`}</SubTitle>
          )
        )}
        <StyledSubscriptionContainer>
          <StyledSubscriptionPriceContainer>
            <SubscriptionPrice
              type={price.recurringInterval}
              price={price.unitAmount / 100}
            />
          </StyledSubscriptionPriceContainer>
          <StyledBenefitsContainer>
            {benefits.map((benefit, index) => (
              <SubscriptionBenefit key={index}>{benefit}</SubscriptionBenefit>
            ))}
          </StyledBenefitsContainer>
        </StyledSubscriptionContainer>
        {hasWithoutCreditCardTrialPeriod && (
          <StyledChooseTrialContainer>
            {billing.trialPeriods.map((trialPeriod, index) => (
              <CardPicker
                checked={
                  billingCheckoutSession.requirePaymentMethod ===
                  trialPeriod.isCreditCardRequired
                }
                handleChange={handleTrialPeriodChange(
                  trialPeriod.isCreditCardRequired,
                )}
                key={index}
              >
                <TrialCard
                  duration={trialPeriod.duration}
                  withCreditCard={trialPeriod.isCreditCardRequired}
                />
              </CardPicker>
            ))}
          </StyledChooseTrialContainer>
        )}
        <StyledMainButton
          withMarginTop={!hasWithoutCreditCardTrialPeriod}
          className="ContinueButton"
          title="Continue"
          onClick={handleCheckoutSession}
          width={200}
          Icon={() => isSubmitting && <Loader />}
          disabled={isSubmitting}
        />
        <StyledLinkGroup>
          <ActionLink onClick={signOut}>Log out</ActionLink>
          <span />
          <ActionLink href={CAL_LINK} target="_blank" rel="noreferrer">
            Book a Call
          </ActionLink>
        </StyledLinkGroup>
      </>
    )
  );
};
