import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import Stripe from 'stripe';

import { SubTitle } from '@/auth/components/SubTitle.tsx';
import { Title } from '@/auth/components/Title.tsx';
import { billingState } from '@/client-config/states/billingState.ts';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar.tsx';
import { CardPicker } from '@/ui/input/components/CardPicker.tsx';
import { SubscriptionCard } from '@/ui/input/subscription/components/SubscriptionCard.tsx';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledChoosePlanContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(8)} 0
    ${({ theme }) => theme.spacing(1)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ChooseYourPlan = () => {
  const billing = useRecoilValue(billingState);
  const [planSelected, setPlanSelected] =
    useState<Stripe.Price.Recurring.Interval>('month');
  const [prices, setPrices] = useState<Stripe.Price[]>();
  const { enqueueSnackBar } = useSnackBar();
  const handlePlanChange = (type?: Stripe.Price.Recurring.Interval) => {
    return () => {
      if (type && planSelected !== type) {
        setPlanSelected(type);
      }
    };
  };

  const sortPrices = (prices: Stripe.Price[]) => {
    return prices.sort((a: Stripe.Price, b: Stripe.Price) => {
      return (a.unit_amount || 0) - (b.unit_amount || 0);
    });
  };

  const computeInfo = (price: Stripe.Price, prices: Stripe.Price[]): string => {
    if (price.recurring?.interval !== 'year') {
      return 'Cancel anytime';
    }
    const monthPrice = prices.filter(
      (price) => price.recurring?.interval === 'month',
    )?.[0];
    if (monthPrice && monthPrice.unit_amount && price.unit_amount) {
      return `Save $${(12 * monthPrice.unit_amount - price.unit_amount) / 100}`;
    }
    return 'Cancel anytime';
  };

  useEffect(() => {
    fetch(REACT_APP_SERVER_BASE_URL + '/billing/product-prices/base-plan')
      .then((result) => result.json())
      .then((data) => setPrices(sortPrices(data)))
      .catch(() => {
        enqueueSnackBar('Error while fetching prices. Please retry', {
          variant: 'error',
        });
      });
  }, [setPrices, enqueueSnackBar]);

  return (
    prices && (
      <>
        <Title>Choose your Plan</Title>
        <SubTitle>
          Not satisfied in ${billing?.billingFreeTrialDurationInDays} days? Full
          refund.
        </SubTitle>
        <StyledChoosePlanContainer>
          {prices.map((price, index) => (
            <CardPicker
              checked={price.recurring?.interval === planSelected}
              handleChange={handlePlanChange(price.recurring?.interval)}
              key={index}
            >
              <SubscriptionCard
                type={price.recurring?.interval}
                price={(price.unit_amount || 0) / 100}
                info={computeInfo(price, prices)}
              />
            </CardPicker>
          ))}
        </StyledChoosePlanContainer>
      </>
    )
  );
};
