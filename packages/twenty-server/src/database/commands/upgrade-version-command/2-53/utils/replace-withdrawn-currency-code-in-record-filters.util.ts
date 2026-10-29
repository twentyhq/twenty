import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { replaceWithdrawnCurrencyCodeInFilterValue } from 'src/database/commands/upgrade-version-command/2-53/utils/replace-withdrawn-currency-code-in-filter-value.util';

const replaceWithdrawnCurrencyCodeInRecordFilter = ({
  recordFilter,
  currencyFieldMetadataIds,
}: {
  recordFilter: unknown;
  currencyFieldMetadataIds: Set<string>;
}): unknown => {
  if (
    !isPlainObject(recordFilter) ||
    !isString(recordFilter.fieldMetadataId) ||
    !currencyFieldMetadataIds.has(recordFilter.fieldMetadataId) ||
    recordFilter.subFieldName !== 'currencyCode'
  ) {
    return recordFilter;
  }

  const { value, hasChanged } = replaceWithdrawnCurrencyCodeInFilterValue(
    recordFilter.value,
  );

  return hasChanged ? { ...recordFilter, value } : recordFilter;
};

export const replaceWithdrawnCurrencyCodeInRecordFilters = ({
  filter,
  currencyFieldMetadataIds,
}: {
  filter: unknown;
  currencyFieldMetadataIds: Set<string>;
}): unknown => {
  if (!isPlainObject(filter) || !Array.isArray(filter.recordFilters)) {
    return filter;
  }

  return {
    ...filter,
    recordFilters: filter.recordFilters.map((recordFilter) =>
      replaceWithdrawnCurrencyCodeInRecordFilter({
        recordFilter,
        currencyFieldMetadataIds,
      }),
    ),
  };
};
