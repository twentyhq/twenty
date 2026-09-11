import { styled } from '@linaria/react';
import { IconCoins } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// the coins glyph reads as a unit next to the number, so it sits under the smallest icon token
const CREDITS_UNIT_ICON_SIZE = 12;

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
    {isCreditsMeter && <IconCoins size={CREDITS_UNIT_ICON_SIZE} />}
  </StyledAmount>
);
