import { Dialog } from 'twenty-ui/primitives/surfaces';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { SubscriptionBenefit } from '@/settings/billing/components/SubscriptionBenefit';
import { ENTERPRISE_CHECKOUT_SESSION } from '@/settings/enterprise/graphql/queries/enterpriseCheckoutSession';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useApolloClient } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Loader, useToast } from 'twenty-ui/primitives/feedback';
import { MainButton } from 'twenty-ui/components';
import { CardPicker, RadioGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCheckoutButton = styled(MainButton)`
  width: 200px;
`;

export const ENTERPRISE_PLAN_MODAL_ID = 'enterprise-plan-modal';

type BillingInterval = 'monthly' | 'yearly';

const MONTHLY_PRICE = 25;
const YEARLY_PRICE = 19;

const StyledSubscriptionContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  margin: ${themeCssVariables.spacing[8]} 0 ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledPriceContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  margin: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]} 0
    ${themeCssVariables.spacing[4]};
  padding-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledPrice = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xxl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledPriceUnit = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledBenefitsContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledIntervalContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledIntervalCardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledIntervalTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledIntervalSubtitle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
`;

export const EnterprisePlanModal = () => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const { enqueueToast } = useToast();
  const [selectedInterval, setSelectedInterval] =
    useState<BillingInterval>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const client = useApolloClient();

  const benefits = [
    t`SSO (SAML / OIDC)`,
    t`Row-level security`,
    t`Audit logs`,
    t`Advanced Encryption`,
    t`Custom AI Models`,
  ];

  const price = selectedInterval === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
  const priceUnit =
    selectedInterval === 'monthly'
      ? t`seat / month`
      : t`seat / month - billed yearly`;

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      const { data } = await client.query<{
        enterpriseCheckoutSession: string | null;
      }>({
        query: ENTERPRISE_CHECKOUT_SESSION,
        variables: { billingInterval: selectedInterval },
      });

      const checkoutUrl = data?.enterpriseCheckoutSession;

      if (checkoutUrl !== null && checkoutUrl !== undefined) {
        window.open(checkoutUrl, '_blank', 'noopener');
        closeDialog(ENTERPRISE_PLAN_MODAL_ID);
      } else {
        enqueueToast({
          variant: 'error',
          children: t`Could not open Stripe. Please contact support.`,
        });
      }
    } catch {
      enqueueToast({ variant: 'error', children: t`Error opening Stripe` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogInstance dialogId={ENTERPRISE_PLAN_MODAL_ID} dismissible>
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          aria-label={t`Get Organization`}
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="md"
          style={{ padding: 0 }}
        >
          <Dialog.Body
            style={{
              display: 'flex',
              flex: '1 1 0%',
              flexDirection: 'column',
              padding: 'var(--t-spacing-10)',
              alignItems: 'center',
            }}
          >
            <Title noMarginTop>{t`Get Organization`}</Title>
            <SubTitle>{t`Enjoy a 30-day free trial`}</SubTitle>

            <StyledSubscriptionContainer>
              <StyledPriceContainer>
                <StyledPrice>{`$${price}`}</StyledPrice>
                <StyledPriceUnit>{priceUnit}</StyledPriceUnit>
              </StyledPriceContainer>
              <StyledBenefitsContainer>
                {benefits.map((benefit) => (
                  <SubscriptionBenefit key={benefit}>
                    {benefit}
                  </SubscriptionBenefit>
                ))}
              </StyledBenefitsContainer>
            </StyledSubscriptionContainer>

            <RadioGroup
              render={<StyledIntervalContainer />}
              aria-label={t`Billing interval`}
              value={selectedInterval}
              onValueChange={setSelectedInterval}
            >
              <CardPicker value="monthly">
                <StyledIntervalCardContent>
                  <StyledIntervalTitle>{t`Monthly`}</StyledIntervalTitle>
                  <StyledIntervalSubtitle>{`$${MONTHLY_PRICE} / ${t`seat / month`}`}</StyledIntervalSubtitle>
                </StyledIntervalCardContent>
              </CardPicker>
              <CardPicker value="yearly">
                <StyledIntervalCardContent>
                  <StyledIntervalTitle>{t`Yearly`}</StyledIntervalTitle>
                  <StyledIntervalSubtitle>{`$${YEARLY_PRICE} / ${t`seat / month`}`}</StyledIntervalSubtitle>
                </StyledIntervalCardContent>
              </CardPicker>
            </RadioGroup>

            <StyledCheckoutButton
              onClick={handleContinue}
              startIcon={isLoading && <Loader />}
              disabled={isLoading}
            >{t`Continue`}</StyledCheckoutButton>
          </Dialog.Body>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
