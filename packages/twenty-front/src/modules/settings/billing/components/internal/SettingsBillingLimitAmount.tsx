import { styled } from '@linaria/react';
import { IconCoins } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAmount = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type SettingsBillingLimitAmountProps = {
  text: string;
  isCreditsMeter: boolean;
};

export const SettingsBillingLimitAmount = ({
  text,
  isCreditsMeter,
}: SettingsBillingLimitAmountProps) => (
  <StyledAmount>
    {text}
    {isCreditsMeter && <IconCoins size={12} />}
  </StyledAmount>
);
