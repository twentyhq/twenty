import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTagsRow } from '@/onboarding/components/StyledOnboardingStepTagsRow';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { OnboardingCreditsRewardTag } from '@/onboarding/components/import-contacts/OnboardingCreditsRewardTag';
import { OnboardingPlanCard } from '@/onboarding/components/upgrade-free-trial/OnboardingPlanCard';
import { OnboardingTrialExtensionTag } from '@/onboarding/components/upgrade-free-trial/OnboardingTrialExtensionTag';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { SubscriptionPaymentForm } from '@/settings/billing/components/SubscriptionPaymentForm';
import { useBaseLicensedPriceByPlanKeyAndInterval } from '@/settings/billing/hooks/useBaseLicensedPriceByPlanKeyAndInterval';
import { useHandleCheckoutSession } from '@/settings/billing/hooks/useHandleCheckoutSession';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { CAL_LINK, ClickToActionLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type Billing } from '~/generated-metadata/graphql';

const StyledCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledLinkGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;

  > span {
    background-color: ${themeCssVariables.font.color.extraLight};
    border-radius: 50%;
    height: 2px;
    width: 2px;
  }
`;

type UpgradeFreeTrialProps = {
  billing: Billing;
  creditsReward?: number;
};

export const UpgradeFreeTrial = ({
  billing,
  creditsReward,
}: UpgradeFreeTrialProps) => {
  const { t } = useLingui();

  const { getBaseLicensedPriceByPlanKeyAndInterval } =
    useBaseLicensedPriceByPlanKeyAndInterval();

  const [billingCheckoutSession, setBillingCheckoutSession] = useAtomState(
    billingCheckoutSessionState,
  );

  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);

  const [verifyEmailRedirectPath, setVerifyEmailRedirectPath] = useAtomState(
    verifyEmailRedirectPathState,
  );
  if (isDefined(verifyEmailRedirectPath)) {
    setVerifyEmailRedirectPath(undefined);
  }

  const { signOut } = useAuth();

  const currentPlanKey = billingCheckoutSession.plan;
  const baseProductPrice = getBaseLicensedPriceByPlanKeyAndInterval(
    currentPlanKey,
    billingCheckoutSession.interval,
  );

  const withCreditCardTrialPeriod = billing.trialPeriods.find(
    (trialPeriod) => trialPeriod.isCreditCardRequired,
  );
  const withoutCreditCardTrialPeriod = billing.trialPeriods.find(
    (trialPeriod) =>
      !trialPeriod.isCreditCardRequired && trialPeriod.duration !== 0,
  );

  const { handleCheckoutSession, isSubmitting } = useHandleCheckoutSession({
    recurringInterval: billingCheckoutSession.interval,
    plan: billingCheckoutSession.plan,
    requirePaymentMethod: billingCheckoutSession.requirePaymentMethod,
    successUrlPath: AppPath.PlanRequiredSuccess,
  });

  const selectTrialPeriod = (withCreditCard: boolean) => () => {
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

  const requirePaymentMethod = billingCheckoutSession.requirePaymentMethod;
  const trialDuration = withCreditCardTrialPeriod?.duration;

  return (
    <StyledOnboardingStepPage>
      <StyledOnboardingStepHeading>
        <StyledOnboardingStepTitle>{t`Upgrade your free trial`}</StyledOnboardingStepTitle>
        <StyledOnboardingStepSubtitle>
          {isDefined(trialDuration)
            ? t`Insert your billing details to get a ${trialDuration}-day free trial and more AI credits`
            : t`Insert your billing details to get a free trial and more AI credits`}
        </StyledOnboardingStepSubtitle>
        <StyledOnboardingStepTagsRow>
          {isDefined(trialDuration) && (
            <OnboardingTrialExtensionTag duration={trialDuration} />
          )}
          {isDefined(creditsReward) && (
            <OnboardingCreditsRewardTag amount={creditsReward} />
          )}
        </StyledOnboardingStepTagsRow>
      </StyledOnboardingStepHeading>

      <StyledCards>
        <OnboardingPlanCard
          title={t`Upgraded`}
          titleSuffix={t`· FREE`}
          note={t`No charge will be made. You'll receive an email reminder 7 days before it ends.`}
          selected={requirePaymentMethod}
          onSelect={selectTrialPeriod(true)}
        >
          {requirePaymentMethod && isDefined(baseProductPrice) && (
            <SubscriptionPaymentForm
              plan={billingCheckoutSession.plan}
              recurringInterval={billingCheckoutSession.interval}
              amount={baseProductPrice.unitAmount}
            />
          )}
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

      <StyledFooter>
        {!requirePaymentMethod && (
          <MainButton
            title={t`Continue`}
            onClick={handleCheckoutSession}
            fullWidth
            Icon={() => (isSubmitting ? <Loader /> : null)}
            disabled={isSubmitting}
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
    </StyledOnboardingStepPage>
  );
};
