import { useTheme } from '@emotion/react';
import { styled } from '@linaria/react';

import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { formatAmount } from '~/utils/format/formatAmount';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type CurrencyDisplayProps = {
  currencyValue: FieldCurrencyValue | null | undefined;
};

const StyledEllipsisDisplay = styled.div`
  align-items: center;
  display: flex;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

export const CurrencyDisplay = ({ currencyValue }: CurrencyDisplayProps) => {
  const theme = useTheme();

  const shouldDisplayCurrency = isDefined(currencyValue?.currencyCode);

  const CurrencyIcon = isDefined(currencyValue?.currencyCode)
    ? SETTINGS_FIELD_CURRENCY_CODES[currencyValue?.currencyCode]?.Icon
    : null;

  const amountToDisplay = isUndefinedOrNull(currencyValue?.amountMicros)
    ? null
    : currencyValue?.amountMicros / 1000000;

  if (!shouldDisplayCurrency) {
    return <StyledEllipsisDisplay>{0}</StyledEllipsisDisplay>;
  }

  return (
    <StyledEllipsisDisplay>
      {isDefined(CurrencyIcon) && amountToDisplay !== null && (
        <>
          <CurrencyIcon
            color={theme.font.color.primary}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />{' '}
        </>
      )}
      {amountToDisplay !== null ? formatAmount(amountToDisplay) : ''}
    </StyledEllipsisDisplay>
  );
};
