import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

const LOGICAL_OPERATORS = ['and', 'or', 'not'];

// Returns true when a filter would produce no WHERE clause and thus match every
// record of the object type (e.g. {}, { and: [] }, { or: [] }, { not: {} } and
// nested no-op variants). Bulk destroy/delete/update/restore mutations must
// reject such filters to avoid accidentally operating on all records.
export const isEmptyGraphqlFilter = (
  filter: ObjectRecordFilter | undefined | null,
): boolean => {
  if (!isDefined(filter)) {
    return true;
  }

  const filterKeys = Object.keys(filter);

  if (filterKeys.length === 0) {
    return true;
  }

  // Any non-logical key is a real condition, so the filter is not empty.
  const onlyLogicalOperators = filterKeys.every((key) =>
    LOGICAL_OPERATORS.includes(key),
  );

  if (!onlyLogicalOperators) {
    return false;
  }

  // A filter made only of logical operators is empty when every branch is empty.
  const andConditions: ObjectRecordFilter[] = filter.and ?? [];
  const orConditions: ObjectRecordFilter[] = filter.or ?? [];
  const notCondition: ObjectRecordFilter | undefined = filter.not;

  return (
    andConditions.every((condition) => isEmptyGraphqlFilter(condition)) &&
    orConditions.every((condition) => isEmptyGraphqlFilter(condition)) &&
    (!isDefined(notCondition) || isEmptyGraphqlFilter(notCondition))
  );
};
