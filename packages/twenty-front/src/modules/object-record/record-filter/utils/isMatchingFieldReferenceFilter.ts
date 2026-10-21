import { FIELD_REFERENCE_FILTER_OPERATORS } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type FieldReferenceFilterOperator,
} from 'twenty-shared/types';
import { isDefined, parseFieldReferenceFilterValue } from 'twenty-shared/utils';

const toComparableValue = (value: unknown, fieldType: FieldMetadataType) =>
  fieldType === FieldMetadataType.DATE ||
  fieldType === FieldMetadataType.DATE_TIME
    ? new Date(value as string).getTime()
    : Number(value);

export const isMatchingFieldReferenceFilter = ({
  value,
  fieldType,
  operator,
  fieldReferenceValue,
  record,
  parentRecord,
  isWithinNegatedFilter,
}: {
  value: unknown;
  fieldType: FieldMetadataType;
  operator: FieldReferenceFilterOperator;
  fieldReferenceValue: string | undefined;
  record: Record<string, unknown>;
  parentRecord: Record<string, unknown> | undefined;
  isWithinNegatedFilter: boolean;
}): boolean => {
  const fieldReference = parseFieldReferenceFilterValue(fieldReferenceValue);
  // The server only accepts a relation that leads back to the parent record
  const referencedRecord = isDefined(fieldReference?.relationFieldName)
    ? parentRecord
    : record;
  const referencedValue = isDefined(fieldReference)
    ? referencedRecord?.[fieldReference.fieldName]
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

  switch (FIELD_REFERENCE_FILTER_OPERATORS[operator]) {
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
