import { useTheme } from '@emotion/react';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldCurrencyMetadata,
  type FieldCurrencyValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';
import { isDefined } from 'twenty-shared/utils';
import { formatToShortNumber } from '~/utils/format/formatToShortNumber';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type CurrencyDisplayProps = {
  currencyValue: FieldCurrencyValue | null | undefined;
  fieldDefinition: FieldDefinition<FieldCurrencyMetadata>;
};

export const CurrencyDisplay = ({
  currencyValue,
  fieldDefinition,
}: CurrencyDisplayProps) => {
  const theme = useTheme();

  const CurrencyIcon = isDefined(currencyValue?.currencyCode)
    ? SETTINGS_FIELD_CURRENCY_CODES[currencyValue?.currencyCode]?.Icon
    : null;

  const amountToDisplay = isUndefinedOrNull(currencyValue?.amountMicros)
    ? null
    : currencyValue?.amountMicros / 1000000;

  const format = fieldDefinition.metadata.settings?.format;
  const { formatNumber } = useNumberFormat();

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
      {amountToDisplay !== null
        ? !isDefined(format) || format === 'short'
          ? formatToShortNumber(amountToDisplay)
          : formatNumber(amountToDisplay)
        : null}
    </EllipsisDisplay>
  );
};
