import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

// Returns true when a filter would produce no WHERE clause and thus match every
// record of the object type (e.g. {}, { and: [] }, { or: [] }, { not: {} }).
// Bulk destroy/delete/update mutations must reject such filters to avoid
// accidentally operating on all records.
export const isEmptyGraphqlFilter = (
  filter: Partial<ObjectRecordFilter> | undefined | null,
): boolean => {
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
    andConditions.some((condition) => !isEmptyGraphqlFilter(condition));
  const hasMeaningfulOr =
    orConditions.length > 0 &&
    orConditions.some((condition) => !isEmptyGraphqlFilter(condition));
  const hasMeaningfulNot =
    isDefined(notCondition) && !isEmptyGraphqlFilter(notCondition);

  return !hasMeaningfulAnd && !hasMeaningfulOr && !hasMeaningfulNot;
};
