import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { SubscriptionInterval } from '~/generated-metadata/graphql';

type SubscriptionPriceProps = {
  type: SubscriptionInterval;
  price: number;
};

const StyledPriceSpan = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xxl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledPriceUnitSpan = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const formatYearlyPriceToMonthly = (price: number): number => {
  const monthlyPrice = price / 12;

  return Number.isInteger(monthlyPrice)
    ? monthlyPrice
    : Number(monthlyPrice.toFixed(2));
};

export const SubscriptionPrice = ({ type, price }: SubscriptionPriceProps) => {
  const { t } = useLingui();
  const pricePerSeat =
    type === SubscriptionInterval.Year
      ? formatYearlyPriceToMonthly(price)
      : price;

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
