import { isNonEmptyArray } from 'twenty-shared/utils';

import { type LogConsoleFilter } from '@/log-console/types/LogConsoleFilter';
import { type LogConsoleEventLogSource } from '@/log-console/types/LogConsoleSource';
import { type EventLogFieldFilterInput } from '~/generated-metadata/graphql';

export const getLogConsoleFieldFilters = ({
  source,
  filters,
}: {
  source: Pick<LogConsoleEventLogSource, 'fieldFilters' | 'filterFields'>;
  filters: LogConsoleFilter[];
}): EventLogFieldFilterInput[] => [
  ...(source.fieldFilters ?? []),
  ...(source.filterFields ?? []).flatMap((filterField) =>
    filters
      .filter(
        (filter) =>
          filter.filterFieldId === filterField.id &&
          isNonEmptyArray(filter.values),
      )
      .map(({ operand, values }) => ({
        field: filterField.serverField,
        operand,
        values,
      })),
  ),
];
