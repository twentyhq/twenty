import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

// Intentionally shallow structural guard: detects a missing filter, `{}`, and
// empty / all-empty `and` / `or` wrappers. It deliberately does NOT inspect
// `not`, composite (`{ name: {} }`) or relation (`{ company: {} }`) emptiness —
// those "defined but non-constraining" cases are caught later by
// `filterProducesWhereCondition` (which reuses the real SQL filter parser).
// Keep this cheap and do not duplicate the parser's traversal here.
export const isEmptyRecordFilter = (
  filter: Partial<ObjectRecordFilter> | undefined | null,
): boolean => {
  if (!isDefined(filter)) {
    return true;
  }

  const filterKeys = Object.keys(filter);

  if (filterKeys.length === 0) {
    return true;
  }

  return filterKeys.every((filterKey) => {
    if (filterKey !== 'and' && filterKey !== 'or') {
      return false;
    }

    const subFilters = (filter as Record<string, unknown>)[filterKey];

    if (!Array.isArray(subFilters) || subFilters.length === 0) {
      return true;
    }

    return subFilters.every((subFilter) =>
      isEmptyRecordFilter(subFilter as Partial<ObjectRecordFilter>),
    );
  });
};

export function assertRecordFilterIsNotEmpty(
  filter: Partial<ObjectRecordFilter> | undefined | null,
): asserts filter is Partial<ObjectRecordFilter> {
  if (isEmptyRecordFilter(filter)) {
    throw new CommonQueryRunnerException(
      'A non-empty filter is required',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
