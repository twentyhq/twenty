import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

// Bounds the recursion below so a pathologically nested filter cannot overflow
// the stack (DoS). Real filters are shallow; legitimate nesting never approaches
// this. When the bound is exceeded we fail safe by treating the filter as empty
// (-> the bulk mutation is rejected) rather than allowing an unverified filter
// through, which could otherwise re-introduce the all-records bypass via deep
// nesting.
const MAX_FILTER_DEPTH = 25;

// Returns true when a filter would produce no WHERE clause and thus match every
// record of the object type (e.g. {}, { and: [] }, { or: [] }, { not: {} }).
// Bulk destroy/delete/update mutations must reject such filters to avoid
// accidentally operating on all records.
export const isEmptyGraphqlFilter = (
  filter: Partial<ObjectRecordFilter> | undefined | null,
  depth = 0,
): boolean => {
  if (depth > MAX_FILTER_DEPTH) {
    return true;
  }

  if (!isDefined(filter)) {
    return true;
  }

  const filterKeys = Object.keys(filter);

  if (filterKeys.length === 0) {
    return true;
  }

  // A filter made only of logical operators is empty when every branch is empty.
  const onlyLogicalOperators = filterKeys.every((key) =>
    ['and', 'or', 'not'].includes(key),
  );

  if (!onlyLogicalOperators) {
    return false;
  }

  const andConditions: Partial<ObjectRecordFilter>[] = filter.and ?? [];
  const orConditions: Partial<ObjectRecordFilter>[] = filter.or ?? [];
  const notCondition: Partial<ObjectRecordFilter> | undefined = filter.not;

  const hasMeaningfulAnd =
    andConditions.length > 0 &&
    andConditions.some((condition) => !isEmptyGraphqlFilter(condition, depth + 1));
  const hasMeaningfulOr =
    orConditions.length > 0 &&
    orConditions.some((condition) => !isEmptyGraphqlFilter(condition, depth + 1));
  const hasMeaningfulNot =
    isDefined(notCondition) && !isEmptyGraphqlFilter(notCondition, depth + 1);

  return !hasMeaningfulAnd && !hasMeaningfulOr && !hasMeaningfulNot;
};
