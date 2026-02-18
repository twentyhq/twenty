import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { SubscriptionBenefit } from '@/billing/components/SubscriptionBenefit';
import { SubscriptionPrice } from '@/billing/components/SubscriptionPrice';
import { TrialCard } from '@/billing/components/TrialCard';
import { useBaseLicensedPriceByPlanKeyAndInterval } from '@/billing/hooks/useBaseLicensedPriceByPlanKeyAndInterval';
import { useBaseProductByPlanKey } from '@/billing/hooks/useBaseProductByPlanKey';
import { useHandleCheckoutSession } from '@/billing/hooks/useHandleCheckoutSession';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilState, useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { CardPicker, MainButton } from 'twenty-ui/input';
import { CAL_LINK, ClickToActionLink } from 'twenty-ui/navigation';
import { BillingPlanKey, type Billing } from '~/generated-metadata/graphql';

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

const StyledOrganizationBenefitsContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
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

export const ChooseYourPlanContent = ({ billing }: { billing: Billing }) => {
  const { t } = useLingui();

  const { getBaseProductByPlanKey } = useBaseProductByPlanKey();
  const { getBaseLicensedPriceByPlanKeyAndInterval } =
    useBaseLicensedPriceByPlanKeyAndInterval();

  const [billingCheckoutSession, setBillingCheckoutSession] = useRecoilState(
    billingCheckoutSessionState,
  );

  const calendarBookingPageId = useRecoilValue(calendarBookingPageIdState);

  const [verifyEmailRedirectPath, setVerifyEmailRedirectPath] = useRecoilState(
    verifyEmailRedirectPathState,
  );
  if (isDefined(verifyEmailRedirectPath)) {
    setVerifyEmailRedirectPath(undefined);
  }

  const currentPlanKey = billingCheckoutSession.plan;

  const getPlanBenefits = (planKey: BillingPlanKey) => {
    if (planKey === BillingPlanKey.ENTERPRISE) {
      return {
        organizationBenefits: [
          t`SSO (SAML / OIDC)`,
          t`20,000 workflow node executions`,
          t`Priority support`,
        ],
        standardBenefits: [
          t`Full access`,
          t`Unlimited contacts`,
          t`Email integration`,
          t`Custom objects`,
          t`API & Webhooks`,
        ],
      };
    }

    return {
      organizationBenefits: [],
      standardBenefits: [
        t`Full access`,
        t`Unlimited contacts`,
        t`Email integration`,
        t`Custom objects`,
        t`API & Webhooks`,
        t`10,000 workflow node executions`,
      ],
    };
  };

  const { organizationBenefits, standardBenefits } =
    getPlanBenefits(currentPlanKey);

  const baseProduct = getBaseProductByPlanKey(currentPlanKey);
  const baseProductPrice = getBaseLicensedPriceByPlanKeyAndInterval(
    currentPlanKey,
    billingCheckoutSession.interval,
  );

  const hasWithoutCreditCardTrialPeriod = billing?.trialPeriods.some(
    (trialPeriod) =>
      !trialPeriod.isCreditCardRequired && trialPeriod.duration !== 0,
  );
  const withCreditCardTrialPeriod = billing?.trialPeriods.find(
    (trialPeriod) => trialPeriod.isCreditCardRequired,
  );

  const { handleCheckoutSession, isSubmitting } = useHandleCheckoutSession({
    recurringInterval: billingCheckoutSession.interval,
    plan: billingCheckoutSession.plan,
    requirePaymentMethod: billingCheckoutSession.requirePaymentMethod,
    successUrlPath: AppPath.PlanRequiredSuccess,
  });

  const handleTrialPeriodChange = (withCreditCard: boolean) => {
    return () => {
      if (
        isDefined(baseProductPrice) &&
        billingCheckoutSession.requirePaymentMethod !== withCreditCard
      ) {
        setBillingCheckoutSession({
          plan: currentPlanKey,
          interval: baseProductPrice.recurringInterval,
          requirePaymentMethod: withCreditCard,
        });
      }
    };
  };

  const planChangeLink = (plan: BillingPlanKey) => {
    const interval = billingCheckoutSession.interval;
    const requirePaymentMethod = billingCheckoutSession.requirePaymentMethod;
    return AppPath.PlanRequired.concat(
      `?billingCheckoutSession={%22plan%22:%22${plan}%22,%22interval%22:%22${interval}%22,%22requirePaymentMethod%22:${requirePaymentMethod}}`,
    );
  };

  const { signOut } = useAuth();

  const withCreditCardTrialPeriodDuration = withCreditCardTrialPeriod?.duration;

  return (
    <>
      <Title noMarginTop>
        {hasWithoutCreditCardTrialPeriod
          ? t`Choose your Trial`
          : t`Get your subscription`}
      </Title>
      {hasWithoutCreditCardTrialPeriod ? (
        <SubTitle>{baseProduct.name}</SubTitle>
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
            type={baseProductPrice.recurringInterval}
            price={baseProductPrice.unitAmount / 100}
          />
        </StyledSubscriptionPriceContainer>
        {organizationBenefits.length > 0 && (
          <StyledOrganizationBenefitsContainer>
            {organizationBenefits.map((benefit) => (
              <SubscriptionBenefit key={benefit}>{benefit}</SubscriptionBenefit>
            ))}
          </StyledOrganizationBenefitsContainer>
        )}
        <StyledBenefitsContainer>
          {standardBenefits.map((benefit) => (
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
        <ClickToActionLink onClick={signOut}>
          <Trans>Log out</Trans>
        </ClickToActionLink>
        <span />
        <ClickToActionLink
          href={calendarBookingPageId ? AppPath.BookCall : CAL_LINK}
          target={calendarBookingPageId ? '_self' : '_blank'}
          rel={calendarBookingPageId ? '' : 'noreferrer'}
        >
          <Trans>Book a Call</Trans>
        </ClickToActionLink>
        <span />
        {currentPlanKey === BillingPlanKey.PRO ? (
          <ClickToActionLink href={planChangeLink(BillingPlanKey.ENTERPRISE)}>
            <Trans>Organization plan</Trans>
          </ClickToActionLink>
        ) : (
          <ClickToActionLink href={planChangeLink(BillingPlanKey.PRO)}>
            <Trans>Pro plan</Trans>
          </ClickToActionLink>
        )}
      </StyledLinkGroup>
    </>
  );
};
