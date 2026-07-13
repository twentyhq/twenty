import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { StyledOnboardingContentBlock } from '@/onboarding/components/StyledOnboardingContentBlock';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTagsRow } from '@/onboarding/components/StyledOnboardingStepTagsRow';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { OnboardingCreditsRewardTag } from '@/onboarding/components/import-contacts/OnboardingCreditsRewardTag';
import { OnboardingPlanCard } from '@/onboarding/components/upgrade-free-trial/OnboardingPlanCard';
import { OnboardingTrialExtensionTag } from '@/onboarding/components/upgrade-free-trial/OnboardingTrialExtensionTag';
import { useBaseLicensedPriceByPlanKeyAndInterval } from '@/settings/billing/hooks/useBaseLicensedPriceByPlanKeyAndInterval';
import { useHandleCheckoutSession } from '@/settings/billing/hooks/useHandleCheckoutSession';
import { useStripeAppearance } from '@/settings/billing/hooks/useStripeAppearance';
import { useStripePromise } from '@/settings/billing/hooks/useStripePromise';
import { useSubmitSubscriptionPayment } from '@/settings/billing/hooks/useSubmitSubscriptionPayment';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Info, Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { CAL_LINK, ClickToActionLink } from 'twenty-ui/navigation';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type Billing,
  type BillingPlanKey,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';

const StyledPage = styled(StyledOnboardingStepPage)`
  gap: ${themeCssVariables.spacing[5]};
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[4]};
  }
`;

const StyledCards = styled(StyledOnboardingContentBlock)`
  gap: ${themeCssVariables.spacing['1.5']};
`;

const StyledFooter = styled(StyledOnboardingContentBlock)`
  align-items: center;
  gap: ${themeCssVariables.spacing['1.5']};
`;

const StyledLinkGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;

  > span {
    background-color: ${themeCssVariables.font.color.extraLight};
    border-radius: 50%;
    corner-shape: round;
    height: 2px;
    width: 2px;
  }
`;

type UpgradeFreeTrialProps = {
  billing: Billing;
  creditsReward?: number;
};

type UpgradeFreeTrialSubmitButtonProps = {
  plan: BillingPlanKey;
  recurringInterval: SubscriptionInterval;
  couponCode?: string;
};

const UpgradeFreeTrialSubmitButton = ({
  plan,
  recurringInterval,
  couponCode,
}: UpgradeFreeTrialSubmitButtonProps) => {
  const { t } = useLingui();

  const { submit, isSubmitting, isStripeReady } = useSubmitSubscriptionPayment({
    plan,
    recurringInterval,
    couponCode,
  });

  return (
    <MainButton
      title={t`Continue`}
      onClick={submit}
      fullWidth
      Icon={() => (isSubmitting ? <Loader /> : null)}
      disabled={!isStripeReady || isSubmitting}
    />
  );
};

type UpgradeFreeTrialContentProps = {
  billing: Billing;
  isPaymentAvailable: boolean;
};

const UpgradeFreeTrialContent = ({
  billing,
  isPaymentAvailable,
}: UpgradeFreeTrialContentProps) => {
  const { t } = useLingui();

  const { getBaseLicensedPriceByPlanKeyAndInterval } =
    useBaseLicensedPriceByPlanKeyAndInterval();

  const [billingCheckoutSession, setBillingCheckoutSession] = useAtomState(
    billingCheckoutSessionState,
  );

  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const customerEmail = useAtomStateValue(currentUserState)?.email;

  const { signOut } = useAuth();

  const currentPlanKey = billingCheckoutSession.plan;
  const baseProductPrice = getBaseLicensedPriceByPlanKeyAndInterval(
    currentPlanKey,
    billingCheckoutSession.interval,
  );

  const withoutCreditCardTrialPeriod = billing.trialPeriods.find(
    (trialPeriod) =>
      !trialPeriod.isCreditCardRequired && trialPeriod.duration !== 0,
  );

  const { handleCheckoutSession, isSubmitting: isCheckoutSubmitting } =
    useHandleCheckoutSession({
      recurringInterval: billingCheckoutSession.interval,
      plan: billingCheckoutSession.plan,
      requirePaymentMethod: billingCheckoutSession.requirePaymentMethod,
      successUrlPath: AppPath.PlanRequiredSuccess,
      couponCode: billingCheckoutSession.couponCode,
    });

  const selectTrialPeriod = (withCreditCard: boolean) => () => {
    if (
      isDefined(baseProductPrice) &&
      billingCheckoutSession.requirePaymentMethod !== withCreditCard
    ) {
      setBillingCheckoutSession({
        ...billingCheckoutSession,
        plan: currentPlanKey,
        interval: baseProductPrice.recurringInterval,
        requirePaymentMethod: withCreditCard,
      });
    }
  };

  const requirePaymentMethod = billingCheckoutSession.requirePaymentMethod;

  return (
    <>
      <OnboardingStepAnimatedItem index={3}>
        <StyledCards>
          <OnboardingPlanCard
            title={t`Upgraded`}
            titleSuffix={t`· FREE`}
            note={t`No charge will be made. You'll receive an email reminder 7 days before it ends.`}
            selected={requirePaymentMethod}
            onSelect={selectTrialPeriod(true)}
          >
            {requirePaymentMethod &&
              (isPaymentAvailable ? (
                <PaymentElement
                  options={{
                    layout: 'tabs',
                    defaultValues: isDefined(customerEmail)
                      ? { billingDetails: { email: customerEmail } }
                      : undefined,
                    terms: { card: 'never' },
                  }}
                />
              ) : (
                <Info
                  accent="danger"
                  text={t`Card payment is currently unavailable. Please verify your Stripe configuration or contact your workspace admin.`}
                />
              ))}
          </OnboardingPlanCard>

          {isDefined(withoutCreditCardTrialPeriod) && (
            <OnboardingPlanCard
              title={t`Basic`}
              titleSuffix={t`without credit card`}
              badge={t`${withoutCreditCardTrialPeriod.duration} days`}
              selected={!requirePaymentMethod}
              onSelect={selectTrialPeriod(false)}
            />
          )}
        </StyledCards>
      </OnboardingStepAnimatedItem>

      <OnboardingStepAnimatedItem index={4}>
        <StyledFooter>
          {requirePaymentMethod ? (
            isPaymentAvailable ? (
              <UpgradeFreeTrialSubmitButton
                plan={billingCheckoutSession.plan}
                recurringInterval={billingCheckoutSession.interval}
                couponCode={billingCheckoutSession.couponCode}
              />
            ) : (
              <MainButton title={t`Continue`} fullWidth disabled />
            )
          ) : (
            <MainButton
              title={t`Continue`}
              onClick={handleCheckoutSession}
              fullWidth
              Icon={() => (isCheckoutSubmitting ? <Loader /> : null)}
              disabled={isCheckoutSubmitting}
            />
          )}
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
          </StyledLinkGroup>
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </>
  );
};

export const UpgradeFreeTrial = ({
  billing,
  creditsReward,
}: UpgradeFreeTrialProps) => {
  const { t } = useLingui();

  const { getBaseLicensedPriceByPlanKeyAndInterval } =
    useBaseLicensedPriceByPlanKeyAndInterval();

  const billingCheckoutSession = useAtomStateValue(billingCheckoutSessionState);

  const [verifyEmailRedirectPath, setVerifyEmailRedirectPath] = useAtomState(
    verifyEmailRedirectPathState,
  );
  if (isDefined(verifyEmailRedirectPath)) {
    setVerifyEmailRedirectPath(undefined);
  }

  const stripePromise = useStripePromise();
  const appearance = useStripeAppearance();

  const baseProductPrice = getBaseLicensedPriceByPlanKeyAndInterval(
    billingCheckoutSession.plan,
    billingCheckoutSession.interval,
  );

  const withCreditCardTrialPeriod = billing.trialPeriods.find(
    (trialPeriod) => trialPeriod.isCreditCardRequired,
  );
  const trialDuration = withCreditCardTrialPeriod?.duration;

  return (
    <StyledPage>
      <StyledOnboardingStepHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledOnboardingStepTitle>{t`Upgrade your free trial`}</StyledOnboardingStepTitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledOnboardingStepSubtitle>
            {isDefined(trialDuration)
              ? t`Insert your billing details to get a ${trialDuration}-day free trial and more AI credits`
              : t`Insert your billing details to get a free trial and more AI credits`}
          </StyledOnboardingStepSubtitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={2}>
          <StyledOnboardingStepTagsRow>
            {isDefined(trialDuration) && (
              <OnboardingTrialExtensionTag duration={trialDuration} />
            )}
            {isDefined(creditsReward) && (
              <OnboardingCreditsRewardTag amount={creditsReward} />
            )}
          </StyledOnboardingStepTagsRow>
        </OnboardingStepAnimatedItem>
      </StyledOnboardingStepHeading>

      {isDefined(stripePromise) && isDefined(baseProductPrice) ? (
        <Elements
          stripe={stripePromise}
          options={{
            mode: 'subscription',
            amount: baseProductPrice.unitAmount,
            currency: 'usd',
            paymentMethodTypes: ['card'],
            appearance,
          }}
        >
          <UpgradeFreeTrialContent billing={billing} isPaymentAvailable />
        </Elements>
      ) : (
        <UpgradeFreeTrialContent billing={billing} isPaymentAvailable={false} />
      )}
    </StyledPage>
  );
};
