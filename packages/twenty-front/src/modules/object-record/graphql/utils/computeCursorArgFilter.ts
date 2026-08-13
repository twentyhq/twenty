import {
  FieldMetadataType,
  type RecordGqlOperationFilter,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { buildOptionBackedCursorComparison } from '@/object-record/graphql/utils/buildOptionBackedCursorComparison';
import {
  type CursorOrderByField,
  resolveCursorOrderByFields,
} from '@/object-record/graphql/utils/resolveCursorOrderByFields';

const isAscendingOrder = (direction: string): boolean =>
  direction === 'AscNullsFirst' || direction === 'AscNullsLast';

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

const isOptionBackedFieldType = (type: FieldMetadataType): boolean =>
  type === FieldMetadataType.SELECT || type === FieldMetadataType.RATING;

const areNullsSortedFirst = (direction: string): boolean =>
  direction === 'AscNullsFirst' || direction === 'DescNullsFirst';

export const computeCursorArgFilter = ({
  orderBy,
  cursorRecordValues,
  isForwardPagination,
  fieldMetadataItems,
}: {
  orderBy: RecordGqlOperationOrderBy;
  cursorRecordValues: Record<string, unknown>;
  isForwardPagination: boolean;
  fieldMetadataItems: Pick<FieldMetadataItem, 'name' | 'type' | 'options'>[];
}): RecordGqlOperationFilter => {
  const fields = resolveCursorOrderByFields(orderBy);

  const isOptionBackedField = (field: CursorOrderByField): boolean => {
    if (isDefined(field.subFieldName)) {
      return false;
    }

    const fieldMetadataItem = fieldMetadataItems.find(
      (fieldMetadataItemToCheck) =>
        fieldMetadataItemToCheck.name === field.fieldName,
    );

    return (
      isDefined(fieldMetadataItem) &&
      isOptionBackedFieldType(fieldMetadataItem.type)
    );
  };

  const cumulativeConditions = fields
    .map((field, index) => {
      const equalityPrefixes = fields.slice(0, index).map((prevField) => {
        const prevCursorValue = getCursorValue(cursorRecordValues, prevField);

        if (isOptionBackedField(prevField) && !isDefined(prevCursorValue)) {
          return { [prevField.fieldName]: { is: 'NULL' } };
        }

        return buildCursorWhereCondition(prevField, 'eq', prevCursorValue);
      });

      const ascending = isAscendingOrder(field.direction);
      const shouldTakeGreaterValues = ascending
        ? isForwardPagination
        : !isForwardPagination;
      const cursorValue = getCursorValue(cursorRecordValues, field);

      const fieldMetadataItem = fieldMetadataItems.find(
        (fieldMetadataItemToCheck) =>
          fieldMetadataItemToCheck.name === field.fieldName,
      );

      const buildOptionBackedComparison =
        (): RecordGqlOperationFilter | null => {
          if (!isDefined(fieldMetadataItem)) {
            return null;
          }

          if (!isDefined(cursorValue)) {
            const shouldMatchNonNullValues = isForwardPagination
              ? areNullsSortedFirst(field.direction)
              : !areNullsSortedFirst(field.direction);

            return shouldMatchNonNullValues
              ? { [field.fieldName]: { is: 'NOT_NULL' } }
              : null;
          }

          return buildOptionBackedCursorComparison({
            fieldName: field.fieldName,
            fieldMetadataItem,
            cursorValue,
            shouldTakeGreaterValues,
          });
        };

      const comparison = isOptionBackedField(field)
        ? buildOptionBackedComparison()
        : buildCursorWhereCondition(
            field,
            shouldTakeGreaterValues ? 'gt' : 'lt',
            cursorValue,
          );

      if (!isDefined(comparison)) {
        return null;
      }

      const conditions = [...equalityPrefixes, comparison];

      return conditions.length === 1 ? conditions[0] : { and: conditions };
    })
    .filter(isDefined);

  if (cumulativeConditions.length === 0) return {};

  return { or: cumulativeConditions };
};
