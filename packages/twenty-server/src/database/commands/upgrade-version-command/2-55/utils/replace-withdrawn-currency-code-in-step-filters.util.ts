import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { replaceWithdrawnCurrencyCodeInFilterValue } from 'src/database/commands/upgrade-version-command/2-55/utils/replace-withdrawn-currency-code-in-filter-value.util';

export const replaceWithdrawnCurrencyCodeInStepFilters = ({
  stepFilters,
  currencyFieldMetadataIds,
}: {
  stepFilters: unknown;
  currencyFieldMetadataIds: Set<string>;
}): unknown => {
  if (!Array.isArray(stepFilters)) {
    return stepFilters;
  }

  return stepFilters.map((stepFilter) => {
    if (
      !isPlainObject(stepFilter) ||
      !isString(stepFilter.fieldMetadataId) ||
      !currencyFieldMetadataIds.has(stepFilter.fieldMetadataId) ||
      stepFilter.compositeFieldSubFieldName !== 'currencyCode'
    ) {
      return stepFilter;
    }

    const { value, hasChanged } = replaceWithdrawnCurrencyCodeInFilterValue(
      stepFilter.value,
    );

    return hasChanged ? { ...stepFilter, value } : stepFilter;
  });
};
