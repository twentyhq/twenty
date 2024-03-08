import { useContext } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';

import { EllipsisDisplay } from './EllipsisDisplay';

type CurrencyDisplayProps = {
  amount?: number | null;
};

const StyledEllipsisDisplay = styled(EllipsisDisplay)`
  align-items: center;
  display: flex;
`;

export const CurrencyDisplay = ({ amount }: CurrencyDisplayProps) => {
  const { showCurrencySymbol, currencyValues } = useContext(FieldContext);

  const theme = useTheme();

  const currencyCode = currencyValues?.currencyCode || CurrencyCode.USD;

  const currencyInfo = SETTINGS_FIELD_CURRENCY_CODES[currencyCode];

  const { Icon } = currencyInfo;

  return (
    <StyledEllipsisDisplay>
      {showCurrencySymbol && (
        <>
          <Icon
            color={theme.font.color.primary}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />{' '}
        </>
      )}
      {amount}
    </StyledEllipsisDisplay>
  );
};
