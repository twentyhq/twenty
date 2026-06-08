import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import {
  type ResolvedOrderByField,
  resolveOrderByFields,
} from '@/object-record/record-show/utils/resolveOrderByFields';

const getFieldValue = (
  record: Record<string, unknown>,
  field: ResolvedOrderByField,
): unknown => {
  if (field.subFieldName) {
    return (record[field.fieldName] as Record<string, unknown> | undefined)?.[
      field.subFieldName
    ];
  }

  return record[field.fieldName];
};

const buildFieldFilter = (
  field: ResolvedOrderByField,
  operator: string,
  value: unknown,
): RecordGqlOperationFilter =>
  field.subFieldName
    ? { [field.fieldName]: { [field.subFieldName]: { [operator]: value } } }
    : { [field.fieldName]: { [operator]: value } };

const isAscending = (direction: string): boolean =>
  direction === 'AscNullsFirst' || direction === 'AscNullsLast';

// Builds a keyset pagination filter that selects records strictly before/after
// the current record in the sort order using OR/AND conditions.
export const buildKeysetPaginationFilter = ({
  orderBy,
  currentRecordValues,
  direction,
}: {
  orderBy: Parameters<typeof resolveOrderByFields>[0];
  currentRecordValues: Record<string, unknown>;
  direction: 'before' | 'after';
}): RecordGqlOperationFilter => {
  const isForward = direction === 'after';
  const fields = resolveOrderByFields(orderBy);

  const orConditions: RecordGqlOperationFilter[] = fields.map(
    (field, index) => {
      const equalityPrefixes = fields
        .slice(0, index)
        .map((prevField) =>
          buildFieldFilter(
            prevField,
            'eq',
            getFieldValue(currentRecordValues, prevField),
          ),
        );

      const asc = isAscending(field.direction);
      const operator = (asc ? isForward : !isForward) ? 'gt' : 'lt';
      const comparison = buildFieldFilter(
        field,
        operator,
        getFieldValue(currentRecordValues, field),
      );

      const conditions = [...equalityPrefixes, comparison];

      return conditions.length === 1 ? conditions[0] : { and: conditions };
    },
  );

  if (orConditions.length === 0) return {};

  return { or: orConditions };
};
