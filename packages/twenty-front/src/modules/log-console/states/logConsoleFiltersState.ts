import { isNonEmptyString, isString } from '@sniptt/guards';

import { type LogConsoleFilter } from '@/log-console/types/LogConsoleFilter';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { EventLogFilterOperand } from '~/generated-metadata/graphql';

export const logConsoleFiltersState = createAtomState<LogConsoleFilter[]>({
  key: 'logConsoleFiltersState',
  defaultValue: [],
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: (filters) =>
    Array.isArray(filters) &&
    filters.every(
      (filter) =>
        isNonEmptyString(filter?.filterFieldId) &&
        Object.values(EventLogFilterOperand).includes(filter.operand) &&
        Array.isArray(filter.values) &&
        filter.values.every(isString),
    ),
});
