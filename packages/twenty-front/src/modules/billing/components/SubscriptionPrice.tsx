import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();
  const pricePerSeat =
    type === SubscriptionInterval.Year ? (price / 12).toFixed(2) : price;

  let priceUnit = '';
  switch (type) {
    case SubscriptionInterval.Month:
      priceUnit = t`seat / month`;
      break;
    case SubscriptionInterval.Year:
      priceUnit = t`seat / month - billed yearly`;
      break;
  }

  return (
    <>
      <StyledPriceSpan>{`$${pricePerSeat}`}</StyledPriceSpan>
      <StyledPriceUnitSpan>{priceUnit}</StyledPriceUnitSpan>
    </>
  );
};
