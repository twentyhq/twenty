import {
  type RecordGqlOperationFilter,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

const ORDER_DIRECTIONS = new Set([
  'AscNullsFirst',
  'AscNullsLast',
  'DescNullsFirst',
  'DescNullsLast',
]);

const isOrderByDirection = (value: unknown): value is string =>
  typeof value === 'string' && ORDER_DIRECTIONS.has(value);

const isAscending = (direction: string): boolean =>
  direction === 'AscNullsFirst' || direction === 'AscNullsLast';

type ResolvedField = {
  fieldName: string;
  direction: string;
  subFieldName?: string;
};

const resolveOrderByFields = (
  orderBy: RecordGqlOperationOrderBy,
): ResolvedField[] => {
  const fields: ResolvedField[] = [];

  for (const entry of orderBy) {
    for (const [fieldName, value] of Object.entries(entry)) {
      if (isOrderByDirection(value)) {
        fields.push({ fieldName, direction: value });
      } else if (typeof value === 'object' && value !== null) {
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

const getFieldValue = (
  record: Record<string, unknown>,
  field: ResolvedField,
): unknown => {
  if (field.subFieldName) {
    return (record[field.fieldName] as Record<string, unknown> | undefined)?.[
      field.subFieldName
    ];
  }

  return record[field.fieldName];
};

const buildFieldFilter = (
  field: ResolvedField,
  operator: string,
  value: unknown,
): RecordGqlOperationFilter =>
  field.subFieldName
    ? { [field.fieldName]: { [field.subFieldName]: { [operator]: value } } }
    : { [field.fieldName]: { [operator]: value } };

// Builds a keyset pagination filter that selects records strictly before/after
// the current record in the sort order using OR/AND conditions.
export const buildKeysetPaginationFilter = ({
  orderBy,
  currentRecordValues,
  direction,
}: {
  orderBy: RecordGqlOperationOrderBy;
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

export const extractOrderByFieldNames = (
  orderBy: RecordGqlOperationOrderBy,
): Record<string, boolean | Record<string, boolean>> => {
  const gqlFields: Record<string, boolean | Record<string, boolean>> = {
    id: true,
  };

  for (const entry of orderBy) {
    for (const [fieldName, value] of Object.entries(entry)) {
      if (isOrderByDirection(value)) {
        gqlFields[fieldName] = true;
      } else if (typeof value === 'object' && value !== null) {
        const subFields: Record<string, boolean> = {};

        for (const [subFieldName, subValue] of Object.entries(
          value as Record<string, unknown>,
        )) {
          if (isOrderByDirection(subValue)) {
            subFields[subFieldName] = true;
          }
        }
        gqlFields[fieldName] = subFields;
      }
    }
  }

  return gqlFields;
};

const REVERSE_DIRECTION: Record<string, string> = {
  AscNullsFirst: 'DescNullsLast',
  AscNullsLast: 'DescNullsFirst',
  DescNullsFirst: 'AscNullsLast',
  DescNullsLast: 'AscNullsFirst',
};

type OrderByEntry = RecordGqlOperationOrderBy[number];
type OrderByValue = OrderByEntry[string];

export const reverseOrderBy = (
  orderBy: RecordGqlOperationOrderBy,
): RecordGqlOperationOrderBy =>
  orderBy.map((entry) => {
    const reversed: OrderByEntry = {};

    for (const [key, value] of Object.entries(entry)) {
      reversed[key] = reverseValue(value);
    }

    return reversed;
  });

const reverseValue = (value: OrderByValue): OrderByValue => {
  if (isOrderByDirection(value)) {
    return (REVERSE_DIRECTION[value] ?? value) as OrderByValue;
  }
  if (typeof value === 'object' && value !== null) {
    const reversed: OrderByEntry = {};

    for (const [key, subValue] of Object.entries(value as OrderByEntry)) {
      reversed[key] = reverseValue(subValue);
    }

    return reversed;
  }

  return value;
};
