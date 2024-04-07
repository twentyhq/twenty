import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { formatCurrency } from '~/utils/format/formatCurrency';
import { isDefined } from '~/utils/isDefined';

import { EllipsisDisplay } from './EllipsisDisplay';

type CurrencyDisplayProps = {
  currencyValue: FieldCurrencyValue | null | undefined;
};

const StyledEllipsisDisplay = styled(EllipsisDisplay)`
  align-items: center;
  display: flex;
`;

export const CurrencyDisplay = ({ currencyValue }: CurrencyDisplayProps) => {
  const theme = useTheme();

  const shouldDisplayCurrency = isDefined(currencyValue?.currencyCode);

  const CurrencyIcon = isDefined(currencyValue?.currencyCode)
    ? SETTINGS_FIELD_CURRENCY_CODES[currencyValue?.currencyCode]?.Icon
    : null;

  const amountToDisplay = isDefined(currencyValue?.amountMicros)
    ? currencyValue.amountMicros / 1000000
    : 0;

  if (!shouldDisplayCurrency) {
    return <StyledEllipsisDisplay>{0}</StyledEllipsisDisplay>;
  }

  return (
    <StyledEllipsisDisplay>
      {isDefined(CurrencyIcon) && (
        <>
          <CurrencyIcon
            color={theme.font.color.primary}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />{' '}
        </>
      )}
      {amountToDisplay !== 0 ? formatCurrency(amountToDisplay) : ''}
    </StyledEllipsisDisplay>
  );
};
