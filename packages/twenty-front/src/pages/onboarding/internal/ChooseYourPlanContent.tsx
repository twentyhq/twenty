import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { SubscriptionPaymentForm } from '@/settings/billing/components/SubscriptionPaymentForm';
import { TrialCard } from '@/settings/billing/components/TrialCard';
import { useBaseLicensedPriceByPlanKeyAndInterval } from '@/settings/billing/hooks/useBaseLicensedPriceByPlanKeyAndInterval';
import { useBaseProductByPlanKey } from '@/settings/billing/hooks/useBaseProductByPlanKey';
import { useHandleCheckoutSession } from '@/settings/billing/hooks/useHandleCheckoutSession';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { CardPicker, MainButton } from 'twenty-ui/input';
import { CAL_LINK, ClickToActionLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type Billing } from '~/generated-metadata/graphql';

const StyledChooseTrialContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[8]};
  width: 100%;

  > * {
    flex: 1 1 0;
    min-width: 0;
  }
`;

const StyledLinkGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[4]};

  > span {
    background-color: ${themeCssVariables.font.color.light};
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

  const currentPlanKey = billingCheckoutSession.plan;

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
      {billingCheckoutSession.requirePaymentMethod ? (
        <SubscriptionPaymentForm
          plan={billingCheckoutSession.plan}
          recurringInterval={billingCheckoutSession.interval}
          amount={baseProductPrice.unitAmount}
        />
      ) : (
        <MainButton
          title={t`Continue`}
          onClick={handleCheckoutSession}
          width={200}
          Icon={() => isSubmitting && <Loader />}
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
    </>
  );
};
