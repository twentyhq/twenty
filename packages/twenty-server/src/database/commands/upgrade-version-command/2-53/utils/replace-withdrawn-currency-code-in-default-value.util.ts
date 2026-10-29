import { isPlainObject } from 'twenty-shared/utils';

import { REPLACEMENT_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-53/constants/replacement-currency-code.constant';
import { WITHDRAWN_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-53/constants/withdrawn-currency-code.constant';
import { type MappedValue } from 'src/database/commands/upgrade-version-command/2-53/types/mapped-value.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const replaceWithdrawnCurrencyCodeInDefaultValue = (
  defaultValue: FlatFieldMetadata['defaultValue'],
): MappedValue<FlatFieldMetadata['defaultValue']> => {
  if (
    !isPlainObject(defaultValue) ||
    !('currencyCode' in defaultValue) ||
    defaultValue.currencyCode !== `'${WITHDRAWN_CURRENCY_CODE}'`
  ) {
    return { value: defaultValue, hasChanged: false };
  }

  return {
    value: {
      ...defaultValue,
      currencyCode: `'${REPLACEMENT_CURRENCY_CODE}'`,
    },
    hasChanged: true,
  };
};
