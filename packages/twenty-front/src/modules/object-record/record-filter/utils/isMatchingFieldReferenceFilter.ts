import { FIELD_REFERENCE_FILTER_OPERATORS } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type FieldReferenceFilterOperator,
} from 'twenty-shared/types';
import { isDefined, parseFieldReferenceFilterValue } from 'twenty-shared/utils';

const INTEGER_PATTERN = /^-?\d+$/;
const SUB_MILLISECOND_DIGITS_PATTERN = /\.\d{3}(\d{1,3})/;

const compareNumbers = (left: number, right: number) => Math.sign(left - right);

// Postgres keeps microseconds, which Date drops
const getSubMillisecondDigits = (value: string) =>
  Number(
    (SUB_MILLISECOND_DIGITS_PATTERN.exec(value)?.[1] ?? '').padEnd(3, '0'),
  );

const compareDates = (left: string, right: string) => {
  const millisecondComparison = compareNumbers(
    new Date(left).getTime(),
    new Date(right).getTime(),
  );

  if (millisecondComparison !== 0) {
    return millisecondComparison;
  }

  return compareNumbers(
    getSubMillisecondDigits(left),
    getSubMillisecondDigits(right),
  );
};

// Big integers arrive as strings that Number would round
const compareIntegerStrings = (left: string, right: string) => {
  const difference = BigInt(left) - BigInt(right);

  if (difference === BigInt(0)) {
    return 0;
  }

  return difference > BigInt(0) ? 1 : -1;
};

const compareFieldValues = ({
  value,
  referencedValue,
  fieldType,
}: {
  value: unknown;
  referencedValue: unknown;
  fieldType: FieldMetadataType;
}) => {
  if (
    fieldType === FieldMetadataType.DATE ||
    fieldType === FieldMetadataType.DATE_TIME
  ) {
    return compareDates(String(value), String(referencedValue));
  }

  const valueString = String(value);
  const referencedValueString = String(referencedValue);

  if (
    INTEGER_PATTERN.test(valueString) &&
    INTEGER_PATTERN.test(referencedValueString)
  ) {
    return compareIntegerStrings(valueString, referencedValueString);
  }

  return compareNumbers(Number(value), Number(referencedValue));
};

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

  // An unfetched field, like a NULL one in SQL, excludes the record even under a negation
  if (!isDefined(value) || !isDefined(referencedValue)) {
    return isWithinNegatedFilter;
  }

  const comparison = compareFieldValues({ value, referencedValue, fieldType });

  switch (FIELD_REFERENCE_FILTER_OPERATORS[operator]) {
    case 'gt':
      return comparison > 0;
    case 'gte':
      return comparison >= 0;
    case 'lt':
      return comparison < 0;
    case 'lte':
      return comparison <= 0;
  }
};
