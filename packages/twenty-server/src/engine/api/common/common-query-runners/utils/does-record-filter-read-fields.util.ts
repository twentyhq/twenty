import { isString } from '@sniptt/guards';
import { FIELD_REFERENCE_FILTER_OPERATORS } from 'twenty-shared/constants';
import { isPlainObject } from 'twenty-shared/utils';

const LOGICAL_OPERATORS = ['and', 'or', 'not'];

const isFieldReferenceFilterOperator = (key: string): boolean =>
  key in FIELD_REFERENCE_FILTER_OPERATORS;

const doesFilterKeyReadFields = ({
  filter,
  fieldNames,
}: {
  filter: unknown;
  fieldNames: Set<string>;
}): boolean => {
  if (Array.isArray(filter)) {
    return filter.some((subFilter) =>
      doesFilterKeyReadFields({ filter: subFilter, fieldNames }),
    );
  }

  if (!isPlainObject(filter)) {
    return false;
  }

  return Object.entries(filter).some(
    ([key, value]) =>
      fieldNames.has(key) ||
      (LOGICAL_OPERATORS.includes(key) &&
        doesFilterKeyReadFields({ filter: value, fieldNames })),
  );
};

// Matches any path segment, even inside relation filters: a false positive only costs the id subquery
const doesFieldReferenceReadFields = ({
  filter,
  fieldNames,
}: {
  filter: unknown;
  fieldNames: Set<string>;
}): boolean => {
  if (Array.isArray(filter)) {
    return filter.some((subFilter) =>
      doesFieldReferenceReadFields({ filter: subFilter, fieldNames }),
    );
  }

  if (!isPlainObject(filter)) {
    return false;
  }

  return Object.entries(filter).some(([key, value]) =>
    isFieldReferenceFilterOperator(key) && isString(value)
      ? value.split('.').some((segment) => fieldNames.has(segment))
      : doesFieldReferenceReadFields({ filter: value, fieldNames }),
  );
};

export const doesRecordFilterReadFields = ({
  filter,
  fieldNames,
}: {
  filter: unknown;
  fieldNames: Set<string>;
}): boolean =>
  doesFilterKeyReadFields({ filter, fieldNames }) ||
  doesFieldReferenceReadFields({ filter, fieldNames });
