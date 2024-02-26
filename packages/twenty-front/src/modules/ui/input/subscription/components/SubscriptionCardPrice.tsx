import styled from '@emotion/styled';

type SubscriptionCardPriceProps = {
  price: number;
};
const StyledSubscriptionCardPriceContainer = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
  margin: ${({ theme }) => theme.spacing(1)} 0
    ${({ theme }) => theme.spacing(2)};
`;
const StyledPriceSpan = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;
const StyledSeatSpan = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;
export const SubscriptionCardPrice = ({
  price,
}: SubscriptionCardPriceProps) => {
  return (
    <StyledSubscriptionCardPriceContainer>
      <StyledPriceSpan>${price}</StyledPriceSpan>
      <StyledSeatSpan>/</StyledSeatSpan>
      <StyledSeatSpan>seat</StyledSeatSpan>
    </StyledSubscriptionCardPriceContainer>
  );
};
