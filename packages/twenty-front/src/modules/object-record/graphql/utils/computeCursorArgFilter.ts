import { isBoolean } from '@sniptt/guards';
import {
  type RecordGqlOperationFilter,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { isOrderByDirection } from '@/object-record/graphql/utils/isOrderByDirection';

type CursorOrderByField = {
  fieldName: string;
  direction: string;
  subFieldName?: string;
};

const isAscendingOrder = (direction: string): boolean =>
  direction === 'AscNullsFirst' || direction === 'AscNullsLast';

const computeOperator = (
  isAscending: boolean,
  isForwardPagination: boolean,
): string =>
  (isAscending ? isForwardPagination : !isForwardPagination) ? 'gt' : 'lt';

const getCursorValue = (
  record: Record<string, unknown>,
  field: CursorOrderByField,
): unknown => {
  if (field.subFieldName) {
    return (record[field.fieldName] as Record<string, unknown> | undefined)?.[
      field.subFieldName
    ];
  }

  return record[field.fieldName];
};

const buildCursorWhereCondition = (
  field: CursorOrderByField,
  operator: string,
  value: unknown,
): RecordGqlOperationFilter =>
  field.subFieldName
    ? { [field.fieldName]: { [field.subFieldName]: { [operator]: value } } }
    : { [field.fieldName]: { [operator]: value } };

// A BOOLEAN field rejects gt/lt (the API allows eq and is only) and holds a
// single value sorting after the cursor, false being scanned before true
// ascending. Returns undefined when the cursor already sits on that last value,
// so no record can sort strictly after it on this field alone.
const buildBooleanComparison = (
  field: CursorOrderByField,
  cursorValue: boolean,
  operator: string,
): RecordGqlOperationFilter | undefined => {
  const valueScannedAfterCursor = operator === 'gt';

  return cursorValue === valueScannedAfterCursor
    ? undefined
    : buildCursorWhereCondition(field, 'eq', valueScannedAfterCursor);
};

const resolveOrderByFields = (
  orderBy: RecordGqlOperationOrderBy,
): CursorOrderByField[] => {
  const fields: CursorOrderByField[] = [];

  for (const entry of orderBy) {
    for (const [fieldName, value] of Object.entries(entry)) {
      if (isOrderByDirection(value)) {
        fields.push({ fieldName, direction: value });
      } else if (isPlainObject(value)) {
        for (const [subFieldName, subValue] of Object.entries(
          value as Record<string, unknown>,
        )) {
          if (isOrderByDirection(subValue)) {
            fields.push({ fieldName, direction: subValue, subFieldName });
          }
        }
      }
    }
  }

  if (!fields.some((field) => field.fieldName === 'id')) {
    fields.push({ fieldName: 'id', direction: 'AscNullsFirst' });
  }

  return fields;
};

export const computeCursorArgFilter = ({
  orderBy,
  cursorRecordValues,
  isForwardPagination,
}: {
  orderBy: RecordGqlOperationOrderBy;
  cursorRecordValues: Record<string, unknown>;
  isForwardPagination: boolean;
}): RecordGqlOperationFilter => {
  const fields = resolveOrderByFields(orderBy);

  const cumulativeConditions = fields.flatMap<RecordGqlOperationFilter>(
    (field, index) => {
      const ascending = isAscendingOrder(field.direction);
      const operator = computeOperator(ascending, isForwardPagination);
      const cursorValue = getCursorValue(cursorRecordValues, field);

      const comparison = isBoolean(cursorValue)
        ? buildBooleanComparison(field, cursorValue, operator)
        : buildCursorWhereCondition(field, operator, cursorValue);

      // Only the tie-breaking fields of the following branches can advance the
      // scan when this field cannot
      if (!isDefined(comparison)) {
        return [];
      }

      const equalityPrefixes = fields
        .slice(0, index)
        .map((prevField) =>
          buildCursorWhereCondition(
            prevField,
            'eq',
            getCursorValue(cursorRecordValues, prevField),
          ),
        );

      const conditions = [...equalityPrefixes, comparison];

      return [conditions.length === 1 ? conditions[0] : { and: conditions }];
    },
  );

  if (cumulativeConditions.length === 0) return {};

  return { or: cumulativeConditions };
};
