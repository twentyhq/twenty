import { useState } from 'react';
import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/SubTitle.tsx';
import { Title } from '@/auth/components/Title.tsx';
import { CardPicker } from '@/ui/input/components/CardPicker.tsx';
import {
  SubscriptionCard,
  SubscriptionCardType,
} from '@/ui/input/subscription/components/SubscriptionCard.tsx';

const StyledChoosePlanContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(8)} 0
    ${({ theme }) => theme.spacing(1)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ChooseYourPlan = () => {
  const [planSelected, setPlanSelected] = useState(
    SubscriptionCardType.Monthly,
  );
  const handlePlanChange = (type: SubscriptionCardType) => {
    return () => {
      if (planSelected !== type) {
        setPlanSelected(type);
      }
    };
  };
  return (
    <>
      <Title>Choose your Plan</Title>
      <SubTitle>Not satisfied in 14 days? Full refund.</SubTitle>
      <StyledChoosePlanContainer>
        <CardPicker
          checked={planSelected === SubscriptionCardType.Monthly}
          handleChange={handlePlanChange(SubscriptionCardType.Monthly)}
        >
          <SubscriptionCard
            type={SubscriptionCardType.Monthly}
            price={9}
            info="Cancel anytime"
          />
        </CardPicker>
        <CardPicker
          checked={planSelected === SubscriptionCardType.Yearly}
          handleChange={handlePlanChange(SubscriptionCardType.Yearly)}
        >
          <SubscriptionCard
            type={SubscriptionCardType.Yearly}
            price={90}
            info="Save $18"
          />
        </CardPicker>
      </StyledChoosePlanContainer>
    </>
  );
};
