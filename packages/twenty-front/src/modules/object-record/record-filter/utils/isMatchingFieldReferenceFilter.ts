import { FIELD_REFERENCE_FILTER_OPERATORS } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type FieldReferenceFilterOperator,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const toComparableValue = (value: unknown, fieldType: FieldMetadataType) =>
  fieldType === FieldMetadataType.DATE ||
  fieldType === FieldMetadataType.DATE_TIME
    ? new Date(value as string).getTime()
    : Number(value);

export const isMatchingFieldReferenceFilter = ({
  value,
  fieldType,
  operator,
  referencedFieldName,
  record,
  parentRecord,
  isWithinNegatedFilter,
}: {
  value: unknown;
  fieldType: FieldMetadataType;
  operator: FieldReferenceFilterOperator;
  referencedFieldName: string | undefined;
  record: Record<string, unknown>;
  parentRecord: Record<string, unknown> | undefined;
  isWithinNegatedFilter: boolean;
}): boolean => {
  const { comparisonOperator, isParentFieldReference } =
    FIELD_REFERENCE_FILTER_OPERATORS[operator];
  const referencedRecord = isParentFieldReference ? parentRecord : record;
  const referencedValue = isDefined(referencedFieldName)
    ? referencedRecord?.[referencedFieldName]
    : undefined;

  // A field that was not fetched cannot be compared, so the record keeps the
  // negation parity to stay excluded, as an unloaded relation does
  if (value === undefined || referencedValue === undefined) {
    return isWithinNegatedFilter;
  }

  // Comparing with null is never true in SQL
  if (value === null || referencedValue === null) {
    return false;
  }

  const comparableValue = toComparableValue(value, fieldType);
  const comparableReferencedValue = toComparableValue(
    referencedValue,
    fieldType,
  );

  switch (comparisonOperator) {
    case 'gt':
      return comparableValue > comparableReferencedValue;
    case 'gte':
      return comparableValue >= comparableReferencedValue;
    case 'lt':
      return comparableValue < comparableReferencedValue;
    case 'lte':
      return comparableValue <= comparableReferencedValue;
  }
};
