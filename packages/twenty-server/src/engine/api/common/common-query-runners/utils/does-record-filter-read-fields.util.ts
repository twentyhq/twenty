import { isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

const LOGICAL_OPERATORS = ['and', 'or', 'not'];

export const doesRecordFilterReadFields = ({
  filter,
  fieldNames,
}: {
  filter: Partial<ObjectRecordFilter> | Partial<ObjectRecordFilter>[];
  fieldNames: Set<string>;
}): boolean => {
  if (Array.isArray(filter)) {
    return filter.some((subFilter) =>
      doesRecordFilterReadFields({ filter: subFilter, fieldNames }),
    );
  }

  return Object.entries(filter).some(([key, value]) => {
    if (fieldNames.has(key)) {
      return true;
    }

    if (!LOGICAL_OPERATORS.includes(key)) {
      return false;
    }

    return (
      (Array.isArray(value) || isPlainObject(value)) &&
      doesRecordFilterReadFields({
        filter: value as Partial<ObjectRecordFilter>,
        fieldNames,
      })
    );
  });
};
