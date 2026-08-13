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

  const cumulativeConditions = fields
    .map((field, index) => {
      const equalityPrefixes = fields
        .slice(0, index)
        .map((prevField) =>
          buildCursorWhereCondition(
            prevField,
            'eq',
            getCursorValue(cursorRecordValues, prevField),
          ),
        );

      const ascending = isAscendingOrder(field.direction);
      const shouldTakeGreaterValues = ascending
        ? isForwardPagination
        : !isForwardPagination;
      const cursorValue = getCursorValue(cursorRecordValues, field);

      const fieldMetadataItem = fieldMetadataItems.find(
        (fieldMetadataItemToCheck) =>
          fieldMetadataItemToCheck.name === field.fieldName,
      );

      const comparison =
        !field.subFieldName &&
        isDefined(fieldMetadataItem) &&
        isOptionBackedFieldType(fieldMetadataItem.type)
          ? buildOptionBackedCursorComparison({
              fieldName: field.fieldName,
              fieldMetadataItem,
              cursorValue,
              shouldTakeGreaterValues,
            })
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
