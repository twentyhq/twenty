import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { SubscriptionBenefit } from '@/billing/components/SubscriptionBenefit';
import { SubscriptionPrice } from '@/billing/components/SubscriptionPrice';
import { TrialCard } from '@/billing/components/TrialCard';
import { useHandleCheckoutSession } from '@/billing/hooks/useHandleCheckoutSession';
import { billingState } from '@/client-config/states/billingState';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
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

const StyledSubscriptionContainer = styled.div<{
  withLongerMarginBottom: boolean;
}>`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};

  display: flex;
  flex-direction: column;
  margin: ${({ theme }) => theme.spacing(8)} 0
    ${({ theme, withLongerMarginBottom }) =>
      theme.spacing(withLongerMarginBottom ? 8 : 2)};
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

export const ChooseYourPlan = () => {
  const billing = useRecoilValue(billingState);
  const { t } = useLingui();

  const benefits = [
    t`Full access`,
    t`Unlimited contacts`,
    t`Email integration`,
    t`Custom objects`,
    t`API & Webhooks`,
    t`1 000 workflow node executions`,
  ];

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

  const withCreditCardTrialPeriodDuration = withCreditCardTrialPeriod?.duration;

  return (
    isDefined(price) &&
    isDefined(billing) && (
      <>
        <Title noMarginTop>
          {hasWithoutCreditCardTrialPeriod
            ? t`Choose your Trial`
            : t`Get your subscription`}
        </Title>
        {hasWithoutCreditCardTrialPeriod ? (
          <SubTitle>
            <Trans>Cancel anytime</Trans>
          </SubTitle>
        ) : (
          withCreditCardTrialPeriod && (
            <SubTitle>
              {t`Enjoy a ${withCreditCardTrialPeriodDuration}-days free trial`}
            </SubTitle>
          )
        )}
        <StyledSubscriptionContainer
          withLongerMarginBottom={!hasWithoutCreditCardTrialPeriod}
        >
          <StyledSubscriptionPriceContainer>
            <SubscriptionPrice
              type={price.recurringInterval}
              price={price.unitAmount / 100}
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
            {billing.trialPeriods.map((trialPeriod) => (
              <CardPicker
                checked={
                  billingCheckoutSession.requirePaymentMethod ===
                  trialPeriod.isCreditCardRequired
                }
                handleChange={handleTrialPeriodChange(
                  trialPeriod.isCreditCardRequired,
                )}
                key={trialPeriod.duration}
              >
                <TrialCard
                  duration={trialPeriod.duration}
                  withCreditCard={trialPeriod.isCreditCardRequired}
                />
              </CardPicker>
            ))}
          </StyledChooseTrialContainer>
        )}
        <MainButton
          title={t`Continue`}
          onClick={handleCheckoutSession}
          width={200}
          Icon={() => isSubmitting && <Loader />}
          disabled={isSubmitting}
        />
        <StyledLinkGroup>
          <ActionLink onClick={signOut}>
            <Trans>Log out</Trans>
          </ActionLink>
          <span />
          <ActionLink href={CAL_LINK} target="_blank" rel="noreferrer">
            <Trans>Book a Call</Trans>
          </ActionLink>
        </StyledLinkGroup>
      </>
    )
  );
};
