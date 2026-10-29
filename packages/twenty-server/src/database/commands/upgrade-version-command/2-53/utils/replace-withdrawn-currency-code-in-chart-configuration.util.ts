import { isPlainObject } from 'twenty-shared/utils';

import { type MappedValue } from 'src/database/commands/upgrade-version-command/2-53/types/mapped-value.type';
import { replaceWithdrawnCurrencyCodeInRecordFilters } from 'src/database/commands/upgrade-version-command/2-53/utils/replace-withdrawn-currency-code-in-record-filters.util';
import { toMappedValue } from 'src/database/commands/upgrade-version-command/2-53/utils/to-mapped-value.util';

export const replaceWithdrawnCurrencyCodeInChartConfiguration = ({
  configuration,
  currencyFieldMetadataIds,
}: {
  configuration: unknown;
  currencyFieldMetadataIds: Set<string>;
}): MappedValue => {
  if (!isPlainObject(configuration) || !('filter' in configuration)) {
    return { value: configuration, hasChanged: false };
  }

  return toMappedValue({
    original: configuration,
    mapped: {
      ...configuration,
      filter: replaceWithdrawnCurrencyCodeInRecordFilters({
        filter: configuration.filter,
        currencyFieldMetadataIds,
      }),
    },
  });
};
