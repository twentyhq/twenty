import { useTheme } from '@emotion/react';

import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';
import { isDefined } from 'twenty-shared/utils';
import { formatAmount } from '~/utils/format/formatAmount';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type CurrencyDisplayProps = {
  currencyValue: FieldCurrencyValue | null | undefined;
};

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
    return <EllipsisDisplay>{0}</EllipsisDisplay>;
  }

  return (
    <EllipsisDisplay>
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
    </EllipsisDisplay>
  );
};
