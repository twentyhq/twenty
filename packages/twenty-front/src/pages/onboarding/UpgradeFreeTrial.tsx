import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingRewardMainButton } from '@/onboarding/components/OnboardingRewardMainButton';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingContentBlock } from '@/onboarding/components/StyledOnboardingContentBlock';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { OnboardingPlanCard } from '@/onboarding/components/upgrade-free-trial/OnboardingPlanCard';
import { CAL_LINK } from '@/onboarding/constants/CalLink';
import { OnboardingPlanTag } from '@/onboarding/components/upgrade-free-trial/OnboardingPlanTag';
import { useSetOnboardingUpgradeTrialFreeCredits } from '@/onboarding/hooks/useSetOnboardingUpgradeTrialFreeCredits';
import { isOnboardingCheckoutPendingState } from '@/onboarding/states/isOnboardingCheckoutPendingState';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { useBaseLicensedPriceByPlanKeyAndInterval } from '@/settings/billing/hooks/useBaseLicensedPriceByPlanKeyAndInterval';
import { useHandleCheckoutSession } from '@/settings/billing/hooks/useHandleCheckoutSession';
import { useStripeAppearance } from '@/settings/billing/hooks/useStripeAppearance';
import { useStripePromise } from '@/settings/billing/hooks/useStripePromise';
import { useSubmitSubscriptionPayment } from '@/settings/billing/hooks/useSubmitSubscriptionPayment';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Info, MainButton } from 'twenty-ui/components';
import { IconCalendarEvent, IconCoins } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button, RadioGroup } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import {
  type Billing,
  type BillingPlanKey,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';

const StyledSubtitleEmphasis = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledCards = styled(StyledOnboardingContentBlock)`
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledFooter = styled(StyledOnboardingContentBlock)`
  align-items: center;
  gap: ${themeCssVariables.spacing[4]};
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
};

type UpgradeFreeTrialSubmitButtonProps = {
  plan: BillingPlanKey;
  recurringInterval: SubscriptionInterval;
  creditsReward: number;
};

const UpgradeFreeTrialSubmitButton = ({
  plan,
  recurringInterval,
  creditsReward,
}: UpgradeFreeTrialSubmitButtonProps) => {
  const { t } = useLingui();

  const { submit, isSubmitting, isStripeReady } = useSubmitSubscriptionPayment({
    plan,
    recurringInterval,
  });

  const setIsOnboardingCheckoutPending = useSetAtomState(
    isOnboardingCheckoutPendingState,
  );
  const setOnboardingUpgradeTrialFreeCredits =
    useSetOnboardingUpgradeTrialFreeCredits();

  const handleSubmit = () => {
    setOnboardingUpgradeTrialFreeCredits(true);
    setIsOnboardingCheckoutPending(true);
    void submit();
  };

  return (
    <OnboardingRewardMainButton
      label={t`Continue`}
      creditsReward={creditsReward}
      onClick={handleSubmit}
      isLoading={isSubmitting}
      disabled={!isStripeReady || isSubmitting}
    />
  );
};

type UpgradeFreeTrialContentProps = {
  billing: Billing;
  isPaymentAvailable: boolean;
  trialDuration?: number;
};

const UpgradeFreeTrialContent = ({
  billing,
  isPaymentAvailable,
  trialDuration,
}: UpgradeFreeTrialContentProps) => {
  const { t } = useLingui();

  const { getBaseLicensedPriceByPlanKeyAndInterval } =
    useBaseLicensedPriceByPlanKeyAndInterval();

  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const upgradeCreditsReward = onboardingConfig?.upgradeCreditsReward ?? 0;
  const { numberFormat } = useNumberFormat();
  const formattedUpgradeCreditsReward = formatOnboardingCredits(
    upgradeCreditsReward,
    numberFormat,
  );
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
    });

  const setIsOnboardingCheckoutPending = useSetAtomState(
    isOnboardingCheckoutPendingState,
  );
  const setOnboardingUpgradeTrialFreeCredits =
    useSetOnboardingUpgradeTrialFreeCredits();

  const handleCheckoutSessionClick = () => {
    setOnboardingUpgradeTrialFreeCredits(
      billingCheckoutSession.requirePaymentMethod,
    );
    setIsOnboardingCheckoutPending(true);
    void handleCheckoutSession();
  };

  const selectTrialPeriod = (withCreditCard: boolean) => {
    if (
      isDefined(baseProductPrice) &&
      billingCheckoutSession.requirePaymentMethod !== withCreditCard
    ) {
      setBillingCheckoutSession({
        plan: currentPlanKey,
        interval: baseProductPrice.recurringInterval,
        requirePaymentMethod: withCreditCard,
      });
      setOnboardingUpgradeTrialFreeCredits(withCreditCard);
    }
  };

  const requirePaymentMethod = billingCheckoutSession.requirePaymentMethod;
  const hasTrialDurationTag = isDefined(trialDuration);
  const hasUpgradeCreditsTag = upgradeCreditsReward > 0;

  return (
    <>
      <OnboardingStepAnimatedItem index={2}>
        <RadioGroup
          render={<StyledCards />}
          aria-label={t`Trial plan`}
          value={requirePaymentMethod}
          onValueChange={selectTrialPeriod}
        >
          <OnboardingPlanCard
            title={t`Upgraded`}
            titleSuffix={t`· FREE`}
            tags={
              hasTrialDurationTag || hasUpgradeCreditsTag ? (
                <>
                  {hasTrialDurationTag && (
                    <OnboardingPlanTag
                      Icon={IconCalendarEvent}
                      value={`${trialDuration}`}
                      suffix={t`days`}
                    />
                  )}
                  {hasUpgradeCreditsTag && (
                    <OnboardingPlanTag
                      Icon={IconCoins}
                      value={`+${formattedUpgradeCreditsReward}`}
                    />
                  )}
                </>
              ) : undefined
            }
            note={t`No charge will be made. You'll receive an email reminder 7 days before it ends.`}
            value={true}
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
                    wallets: {
                      applePay: 'never',
                      googlePay: 'never',
                    },
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
              value={false}
            />
          )}
        </RadioGroup>
      </OnboardingStepAnimatedItem>

      <OnboardingStepAnimatedItem index={3}>
        <StyledFooter>
          {requirePaymentMethod ? (
            isPaymentAvailable ? (
              <UpgradeFreeTrialSubmitButton
                plan={billingCheckoutSession.plan}
                recurringInterval={billingCheckoutSession.interval}
                creditsReward={upgradeCreditsReward}
              />
            ) : (
              <OnboardingRewardMainButton
                label={t`Continue`}
                creditsReward={upgradeCreditsReward}
                onClick={handleCheckoutSessionClick}
                disabled
              />
            )
          ) : (
            <MainButton
              onClick={handleCheckoutSessionClick}
              fullWidth
              startIcon={isCheckoutSubmitting ? <Loader /> : null}
              disabled={isCheckoutSubmitting}
            >
              {t`Continue`}
            </MainButton>
          )}
          <StyledLinkGroup>
            <Button variant="link" onClick={signOut}>
              <Trans>Log out</Trans>
            </Button>
            <span />
            <Button
              variant="link"
              href={calendarBookingPageId ? AppPath.BookCall : CAL_LINK}
              target={calendarBookingPageId ? '_self' : '_blank'}
              rel={calendarBookingPageId ? '' : 'noreferrer'}
            >
              <Trans>Book a Call</Trans>
            </Button>
          </StyledLinkGroup>
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </>
  );
};

export const UpgradeFreeTrial = ({ billing }: UpgradeFreeTrialProps) => {
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
    <StyledOnboardingStepPage>
      <StyledOnboardingStepHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledOnboardingStepTitle>{t`Upgrade your free trial`}</StyledOnboardingStepTitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledOnboardingStepSubtitle>
            {isDefined(trialDuration) ? (
              <Trans>
                Insert your billing details to get a {trialDuration}-day{' '}
                <StyledSubtitleEmphasis>free</StyledSubtitleEmphasis> trial and
                more AI credits
              </Trans>
            ) : (
              <Trans>
                Insert your billing details to get a{' '}
                <StyledSubtitleEmphasis>free</StyledSubtitleEmphasis> trial and
                more AI credits
              </Trans>
            )}
          </StyledOnboardingStepSubtitle>
        </OnboardingStepAnimatedItem>
      </StyledOnboardingStepHeading>

      {isDefined(stripePromise) && isDefined(baseProductPrice) ? (
        <Elements
          stripe={stripePromise}
          options={{
            mode: 'subscription',
            amount: baseProductPrice.unitAmount,
            currency: 'usd',
            paymentMethodTypes: ['card', 'link'],
            appearance,
          }}
        >
          <UpgradeFreeTrialContent
            billing={billing}
            isPaymentAvailable
            trialDuration={trialDuration}
          />
        </Elements>
      ) : (
        <UpgradeFreeTrialContent
          billing={billing}
          isPaymentAvailable={false}
          trialDuration={trialDuration}
        />
      )}
    </StyledOnboardingStepPage>
  );
};
