import styled from '@emotion/styled';
import Stripe from 'stripe';

import { SubscriptionCardPrice } from '@/ui/input/subscription/components/SubscriptionCardPrice.tsx';
import { capitalize } from '~/utils/string/capitalize.ts';

type SubscriptionCardProps = {
  type?: Stripe.Price.Recurring.Interval;
  price: number;
  info: string;
};

const StyledSubscriptionCardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTypeContainer = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  display: flex;
`;

const StyledInfoContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  display: flex;
`;

export const SubscriptionCard = ({
  type,
  price,
  info,
}: SubscriptionCardProps) => {
  return (
    <StyledSubscriptionCardContainer>
      <StyledTypeContainer>{capitalize(type || '')}</StyledTypeContainer>
      <SubscriptionCardPrice price={price} />
      <StyledInfoContainer>{info}</StyledInfoContainer>
    </StyledSubscriptionCardContainer>
  );
};
