import React, { useState } from 'react';
import styled from '@emotion/styled';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { SubscriptionBenefit } from '@/billing/components/SubscriptionBenefit';
import { SubscriptionCard } from '@/billing/components/SubscriptionCard';
import { billingState } from '@/client-config/states/billingState';
import { AppPath } from '@/types/AppPath';
import { Loader } from '@/ui/feedback/loader/components/Loader';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { CardPicker } from '@/ui/input/components/CardPicker';
import {
  ProductPriceEntity,
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

export const ChooseYourPlan = () => {
  const billing = useRecoilValue(billingState);

  const [planSelected, setPlanSelected] = useState('month');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { enqueueSnackBar } = useSnackBar();

  const { data: prices } = useGetProductPricesQuery({
    variables: { product: 'base-plan' },
  });

  const [checkoutSession] = useCheckoutSessionMutation();

  const handlePlanChange = (type?: string) => {
    return () => {
      if (isNonEmptyString(type) && planSelected !== type) {
        setPlanSelected(type);
      }
    };
  };

  const computeInfo = (
    price: ProductPriceEntity,
    prices: ProductPriceEntity[],
  ): string => {
    if (price.recurringInterval !== 'year') {
      return 'Cancel anytime';
    }
    const monthPrice = prices.filter(
      (price) => price.recurringInterval === 'month',
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
          variant: 'error',
        },
      );
      return;
    }
    window.location.replace(data.checkoutSession.url);
  };

  return (
    prices?.getProductPrices?.productPrices && (
      <>
        <Title withMarginTop={false}>Choose your Plan</Title>
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
          <SubscriptionBenefit>Full access</SubscriptionBenefit>
          <SubscriptionBenefit>Unlimited contacts</SubscriptionBenefit>
          <SubscriptionBenefit>Email integration</SubscriptionBenefit>
          <SubscriptionBenefit>Custom objects</SubscriptionBenefit>
          <SubscriptionBenefit>API & Webhooks</SubscriptionBenefit>
          <SubscriptionBenefit>Frequent updates</SubscriptionBenefit>
          <SubscriptionBenefit>And much more</SubscriptionBenefit>
        </StyledBenefitsContainer>
        <MainButton
          title="Continue"
          onClick={handleButtonClick}
          width={200}
          Icon={() => isSubmitting && <Loader />}
          disabled={isSubmitting}
        />
      </>
    )
  );
};
