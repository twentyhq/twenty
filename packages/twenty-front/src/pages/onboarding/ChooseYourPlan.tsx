import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { SubscriptionBenefit } from '@/billing/components/SubscriptionBenefit';
import { SubscriptionCard } from '@/billing/components/SubscriptionCard';
import { billingState } from '@/client-config/states/billingState';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  ActionLink,
  CAL_LINK,
  CardPicker,
  Loader,
  MainButton,
} from 'twenty-ui';
import {
  ProductPriceEntity,
  SubscriptionInterval,
  useCheckoutSessionMutation,
  useGetProductPricesQuery,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

const StyledChoosePlanContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(8)} 0
    ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledBenefitsContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
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

const benefits = [
  'Full access',
  'Unlimited contacts',
  'Email integration',
  'Custom objects',
  'API & Webhooks',
  'Frequent updates',
  'And much more',
];

export const ChooseYourPlan = () => {
  const billing = useRecoilValue(billingState);

  const [planSelected, setPlanSelected] = useState(SubscriptionInterval.Month);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { enqueueSnackBar } = useSnackBar();

  const { data: prices } = useGetProductPricesQuery({
    variables: { product: 'base-plan' },
  });

  const [checkoutSession] = useCheckoutSessionMutation();

  const handlePlanChange = (type?: SubscriptionInterval) => {
    return () => {
      if (isNonEmptyString(type) && planSelected !== type) {
        setPlanSelected(type);
      }
    };
  };

  const { signOut } = useAuth();

  const computeInfo = (
    price: ProductPriceEntity,
    prices: ProductPriceEntity[],
  ): string => {
    if (price.recurringInterval !== SubscriptionInterval.Year) {
      return 'Cancel anytime';
    }
    const monthPrice = prices.filter(
      (price) => price.recurringInterval === SubscriptionInterval.Month,
    )?.[0];
    if (
      isDefined(monthPrice) &&
      isNumber(monthPrice.unitAmount) &&
      monthPrice.unitAmount > 0 &&
      isNumber(price.unitAmount) &&
      price.unitAmount > 0
    ) {
      return `Save $${(12 * monthPrice.unitAmount - price.unitAmount) / 100}`;
    }
    return 'Cancel anytime';
  };

  const handleButtonClick = async () => {
    setIsSubmitting(true);
    const { data } = await checkoutSession({
      variables: {
        recurringInterval: planSelected,
        successUrlPath: AppPath.PlanRequiredSuccess,
      },
    });
    setIsSubmitting(false);
    if (!data?.checkoutSession.url) {
      enqueueSnackBar(
        'Checkout session error. Please retry or contact Twenty team',
        {
          variant: SnackBarVariant.Error,
        },
      );
      return;
    }
    window.location.replace(data.checkoutSession.url);
  };

  return (
    prices?.getProductPrices?.productPrices && (
      <>
        <Title noMarginTop>Choose your Plan</Title>
        <SubTitle>
          Enjoy a {billing?.billingFreeTrialDurationInDays}-day free trial
        </SubTitle>
        <StyledChoosePlanContainer>
          {prices.getProductPrices.productPrices.map((price, index) => (
            <CardPicker
              checked={price.recurringInterval === planSelected}
              handleChange={handlePlanChange(price.recurringInterval)}
              key={index}
            >
              <SubscriptionCard
                type={price.recurringInterval}
                price={price.unitAmount / 100}
                info={computeInfo(price, prices.getProductPrices.productPrices)}
              />
            </CardPicker>
          ))}
        </StyledChoosePlanContainer>
        <StyledBenefitsContainer>
          {benefits.map((benefit, index) => (
            <SubscriptionBenefit key={index}>{benefit}</SubscriptionBenefit>
          ))}
        </StyledBenefitsContainer>
        <MainButton
          title="Continue"
          onClick={handleButtonClick}
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
