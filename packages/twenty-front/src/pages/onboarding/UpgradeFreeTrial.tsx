import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { OnboardingCreditsRewardTag } from '@/onboarding/components/import-contacts/OnboardingCreditsRewardTag';
import { OnboardingPlanCard } from '@/onboarding/components/upgrade-free-trial/OnboardingPlanCard';
import { OnboardingTrialExtensionTag } from '@/onboarding/components/upgrade-free-trial/OnboardingTrialExtensionTag';
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

const CONTENT_BLOCK_WIDTH = 340;

const StyledPage = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[14]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[16]} ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
`;

const StyledTagsRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledLinkGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;

  > span {
    background-color: ${themeCssVariables.font.color.light};
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
    <StyledPage>
      <StyledHeading>
        <StyledTitle>{t`Upgrade your free trial`}</StyledTitle>
        <StyledSubtitle>
          {isDefined(trialDuration)
            ? t`Insert your billing details to get a ${trialDuration}-day free trial and more AI credits`
            : t`Insert your billing details to get a free trial and more AI credits`}
        </StyledSubtitle>
        <StyledTagsRow>
          {isDefined(trialDuration) && (
            <OnboardingTrialExtensionTag duration={trialDuration} />
          )}
          {isDefined(creditsReward) && (
            <OnboardingCreditsRewardTag amount={creditsReward} />
          )}
        </StyledTagsRow>
      </StyledHeading>

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
    </StyledPage>
  );
};
