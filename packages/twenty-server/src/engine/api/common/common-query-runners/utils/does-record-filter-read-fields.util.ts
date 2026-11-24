import { isPlainObject } from 'twenty-shared/utils';

const LOGICAL_OPERATORS = ['and', 'or', 'not'];

export const doesRecordFilterReadFields = ({
  filter,
  fieldNames,
}: {
  filter: unknown;
  fieldNames: Set<string>;
}): boolean => {
  if (Array.isArray(filter)) {
    return filter.some((subFilter) =>
      doesRecordFilterReadFields({ filter: subFilter, fieldNames }),
    );
  }

  if (!isPlainObject(filter)) {
    return false;
  }

  return Object.entries(filter).some(
    ([key, value]) =>
      fieldNames.has(key) ||
      (LOGICAL_OPERATORS.includes(key) &&
        doesRecordFilterReadFields({ filter: value, fieldNames })),
  );
};
