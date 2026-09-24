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
  canHoldNullValue: boolean;
};

type EffectiveScanOrder = {
  isAscending: boolean;
  areNullsScannedLast: boolean;
};

const getEffectiveScanOrder = (
  direction: string,
  isForwardPagination: boolean,
): EffectiveScanOrder => {
  const isAscendingDirection =
    direction === 'AscNullsFirst' || direction === 'AscNullsLast';
  const areNullsPresentedLast =
    direction === 'AscNullsLast' || direction === 'DescNullsLast';

  return {
    isAscending: isAscendingDirection === isForwardPagination,
    areNullsScannedLast: isForwardPagination
      ? areNullsPresentedLast
      : !areNullsPresentedLast,
  };
};

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

const buildEqualityCondition = (
  field: CursorOrderByField,
  cursorValue: unknown,
): RecordGqlOperationFilter =>
  isDefined(cursorValue)
    ? buildCursorWhereCondition(field, 'eq', cursorValue)
    : buildCursorWhereCondition(field, 'is', 'NULL');

const buildStrictlyAfterCondition = (
  field: CursorOrderByField,
  cursorValue: unknown,
  isAscending: boolean,
): RecordGqlOperationFilter | undefined => {
  if (isBoolean(cursorValue)) {
    return cursorValue === isAscending
      ? undefined
      : buildCursorWhereCondition(field, 'eq', isAscending);
  }

  return buildCursorWhereCondition(
    field,
    isAscending ? 'gt' : 'lt',
    cursorValue,
  );
};

const buildComparisonCondition = (
  field: CursorOrderByField,
  cursorValue: unknown,
  { isAscending, areNullsScannedLast }: EffectiveScanOrder,
): RecordGqlOperationFilter | undefined => {
  if (!isDefined(cursorValue)) {
    return areNullsScannedLast
      ? undefined
      : buildCursorWhereCondition(field, 'is', 'NOT_NULL');
  }

  const strictlyAfter = buildStrictlyAfterCondition(
    field,
    cursorValue,
    isAscending,
  );

  if (!areNullsScannedLast || !field.canHoldNullValue) {
    return strictlyAfter;
  }

  const trailingNullBlock = buildCursorWhereCondition(field, 'is', 'NULL');

  return isDefined(strictlyAfter)
    ? { or: [strictlyAfter, trailingNullBlock] }
    : trailingNullBlock;
};

const resolveOrderByFields = (
  orderBy: RecordGqlOperationOrderBy,
): CursorOrderByField[] => {
  const fields: CursorOrderByField[] = [];

  for (const entry of orderBy) {
    for (const [fieldName, value] of Object.entries(entry)) {
      if (isOrderByDirection(value)) {
        fields.push({
          fieldName,
          direction: value,
          canHoldNullValue: fieldName !== 'id',
        });
      } else if (isPlainObject(value)) {
        for (const [subFieldName, subValue] of Object.entries(
          value as Record<string, unknown>,
        )) {
          if (isOrderByDirection(subValue)) {
            fields.push({
              fieldName,
              direction: subValue,
              subFieldName,
              canHoldNullValue: true,
            });
          }
        }
      }
    }
  }

  if (!fields.some((field) => field.fieldName === 'id')) {
    fields.push({
      fieldName: 'id',
      direction: 'AscNullsFirst',
      canHoldNullValue: false,
    });
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
      const comparison = buildComparisonCondition(
        field,
        getCursorValue(cursorRecordValues, field),
        getEffectiveScanOrder(field.direction, isForwardPagination),
      );

      if (!isDefined(comparison)) {
        return [];
      }

      const equalityPrefixes = fields
        .slice(0, index)
        .map((prevField) =>
          buildEqualityCondition(
            prevField,
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
