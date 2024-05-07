import styled from '@emotion/styled';

import { SubscriptionCardPrice } from '@/billing/components/SubscriptionCardPrice';
import { capitalize } from '~/utils/string/capitalize';

type SubscriptionCardProps = {
  type?: string;
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
