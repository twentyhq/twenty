import styled from '@emotion/styled';
import { SubscriptionInterval } from '~/generated-metadata/graphql';

type SubscriptionPriceProps = {
  type: SubscriptionInterval;
  price: number;
};

const StyledPriceSpan = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledPriceUnitSpan = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const SubscriptionPrice = ({ type, price }: SubscriptionPriceProps) => {
  return (
    <>
      <StyledPriceSpan>{`$${price}`}</StyledPriceSpan>
      <StyledPriceUnitSpan>{`seat / ${type.toLocaleLowerCase()}`}</StyledPriceUnitSpan>
    </>
  );
};
