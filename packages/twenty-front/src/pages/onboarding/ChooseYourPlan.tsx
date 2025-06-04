import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { useBillingPaymentProvidersMap } from '@/billing/hooks/useBillingPaymentProvidersMap';
import { useHandleCheckoutSession } from '@/billing/hooks/useHandleCheckoutSession';
import { isBillingPriceLicensed } from '@/billing/utils/isBillingPriceLicensed';
import { billingState } from '@/client-config/states/billingState';
import { OnboardingInterChargeDataForm } from '@/onboarding/components/OnboardingInterChargeDataForm';
import { OnboardingPlanCard } from '@/onboarding/components/OnboardingPlanCard';
import { useInterChargeDataForm } from '@/onboarding/hooks/useInterChargeDataForm';
import {
  OnboardingPlanStep,
  onboardingPlanStepState,
} from '@/onboarding/states/onboardingPlanStepState';
import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { CardPicker, MainButton } from 'twenty-ui/input';
import { CAL_LINK, ClickToActionLink } from 'twenty-ui/navigation';
import { Entries } from 'type-fest';
import { ArrayElement } from 'type-fest/source/internal';
import {
  BillingBaseProductPricesQuery,
  BillingPaymentProviders,
  BillingPlanKey,
  BillingPriceLicensedDto,
  useBillingBaseProductPricesQuery,
} from '~/generated/graphql';

const StyledChoosePlanCardContainer = styled.div`
  display: flex;
  width: 500px;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledChooseProviderContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPaymentProviderCardContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 100%;
`;

const StyledPaymentProviderCardTooltipCard = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
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

const StyledChooseYourPlanPlaceholder = styled.div`
  height: 566px;
`;

export const ChooseYourPlan = () => {
  const billing = useRecoilValue(billingState);
  const { t } = useLingui();

  const [billingCheckoutSession, setBillingCheckoutSession] = useRecoilState(
    billingCheckoutSessionState,
  );

  const { form } = useInterChargeDataForm();

  const onboardingPlanStep = useRecoilValue(onboardingPlanStepState);

  const { data: plans } = useBillingBaseProductPricesQuery();

  const { billingPaymentProvidersMap } = useBillingPaymentProvidersMap();

  const getPlanBenefits = (
    planKey: BillingPlanKey,
    product: ArrayElement<
      BillingBaseProductPricesQuery['plans']
    >['baseProduct'],
  ) => {
    if (isDefined(product.marketingFeatures)) return product.marketingFeatures;
    if (planKey === BillingPlanKey.ENTERPRISE) {
      return [
        t`Full access`,
        t`Unlimited contacts`,
        t`Email integration`,
        t`Custom objects`,
        t`API & Webhooks`,
        t`20,000 workflow node executions`,
        t`SSO (SAML / OIDC)`,
      ];
    }

    return [
      t`Full access`,
      t`Unlimited contacts`,
      t`Email integration`,
      t`Custom objects`,
      t`API & Webhooks`,
      t`10,000 workflow node executions`,
    ];
  };

  const hasWithoutCreditCardTrialPeriod = billing?.trialPeriods.some(
    (trialPeriod) =>
      !trialPeriod.isCreditCardRequired && trialPeriod.duration !== 0,
  );

  const withCreditCardTrialPeriod = billing?.trialPeriods.find(
    (trialPeriod) =>
      trialPeriod.isCreditCardRequired && trialPeriod.duration !== 0,
  );

  const { handleCheckoutSession, isSubmitting } = useHandleCheckoutSession({
    recurringInterval: billingCheckoutSession.interval,
    plan: billingCheckoutSession.plan,
    requirePaymentMethod: billingCheckoutSession.requirePaymentMethod,
    paymentProvider: billingCheckoutSession.paymentProvider,
  });

  const handleChangePaymentProviderChange = (
    paymentProvider: BillingPaymentProviders,
  ) => {
    return () => {
      setBillingCheckoutSession({
        ...billingCheckoutSession,
        paymentProvider,
      });
    };
  };

  const handleChangePlanChange = (plan: BillingPlanKey) => {
    return () => {
      setBillingCheckoutSession({
        ...billingCheckoutSession,
        plan,
      });
    };
  };

  const { signOut } = useAuth();

  const withCreditCardTrialPeriodDuration = withCreditCardTrialPeriod?.duration;

  return (
    <Modal.Content isVerticalCentered>
      {isDefined(billing) ? (
        (() => {
          switch (onboardingPlanStep) {
            case OnboardingPlanStep.Init:
              return (
                <>
                  <Title noMarginTop>
                    {hasWithoutCreditCardTrialPeriod
                      ? t`Choose your Trial`
                      : t`Choose your plan`}
                  </Title>
                  <StyledChoosePlanCardContainer>
                    {plans?.plans.map(({ baseProduct, planKey }, index) => (
                      <>
                        <CardPicker
                          checked={billingCheckoutSession.plan === planKey}
                          handleChange={handleChangePlanChange(planKey)}
                          key={`payment-plan-${index}`}
                          name="payment-plan"
                        >
                          <OnboardingPlanCard
                            productPrice={baseProduct?.prices?.find(
                              (price): price is BillingPriceLicensedDto =>
                                isBillingPriceLicensed(price) &&
                                price.recurringInterval ===
                                  billingCheckoutSession.interval,
                            )}
                            benefits={getPlanBenefits(planKey, baseProduct)}
                            planName={baseProduct.name}
                            withCreditCardTrialPeriod={
                              !!withCreditCardTrialPeriod
                            }
                            withCreditCardTrialPeriodDuration={
                              withCreditCardTrialPeriodDuration
                            }
                            hasWithoutCreditCardTrialPeriod={
                              hasWithoutCreditCardTrialPeriod
                            }
                          />
                        </CardPicker>
                      </>
                    ))}
                  </StyledChoosePlanCardContainer>
                  <Title noMarginTop>{t`Choose your payment method`}</Title>
                  <StyledChooseProviderContainer>
                    {(
                      Object.entries(billingPaymentProvidersMap) as Entries<
                        typeof billingPaymentProvidersMap
                      >
                    ).map(([provider, label]) => (
                      <CardPicker
                        checked={
                          billingCheckoutSession.paymentProvider === provider
                        }
                        handleChange={handleChangePaymentProviderChange(
                          provider,
                        )}
                        key={`payment-provider-${provider}`}
                        name="payment-provider"
                      >
                        <StyledPaymentProviderCardContainer>
                          <StyledPaymentProviderCardTooltipCard>
                            {provider}
                          </StyledPaymentProviderCardTooltipCard>
                          {label}
                        </StyledPaymentProviderCardContainer>
                      </CardPicker>
                    ))}
                  </StyledChooseProviderContainer>
                  <MainButton
                    title={t`Continue`}
                    onClick={() => {
                      handleCheckoutSession();
                    }}
                    width={200}
                    Icon={() => isSubmitting && <Loader />}
                    disabled={isSubmitting}
                  />
                  <StyledLinkGroup>
                    <ClickToActionLink onClick={signOut}>
                      <Trans>Log out</Trans>
                    </ClickToActionLink>
                    {/* <span />
                    <ClickToActionLink href={TWENTY_PRICING_LINK}>
                      <Trans>Change Plan</Trans>
                    </ClickToActionLink> */}
                    <span />
                    <ClickToActionLink
                      href={CAL_LINK}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Trans>Book a Call</Trans>
                    </ClickToActionLink>
                  </StyledLinkGroup>
                </>
              );
            case OnboardingPlanStep.InterChargeData:
              return (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <FormProvider {...form}>
                  <OnboardingInterChargeDataForm
                    handleCheckoutSession={handleCheckoutSession}
                    isLoading={isSubmitting}
                  />
                </FormProvider>
              );
          }
        })()
      ) : (
        <StyledChooseYourPlanPlaceholder />
      )}
    </Modal.Content>
  );
};
