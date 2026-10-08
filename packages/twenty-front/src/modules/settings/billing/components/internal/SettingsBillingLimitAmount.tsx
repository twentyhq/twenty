import { styled } from '@linaria/react';
import { IconCoins } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { UsageUnit } from '~/generated-metadata/graphql';

const CREDITS_UNIT_ICON_SIZE = 12;

const StyledAmount = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type SettingsBillingLimitAmountProps = {
  text: string;
  unit: UsageUnit;
};

export const SettingsBillingLimitAmount = ({
  text,
  unit,
}: SettingsBillingLimitAmountProps) => (
  <StyledAmount>
    {text}
    {unit === UsageUnit.CREDIT && <IconCoins size={CREDITS_UNIT_ICON_SIZE} />}
  </StyledAmount>
);
