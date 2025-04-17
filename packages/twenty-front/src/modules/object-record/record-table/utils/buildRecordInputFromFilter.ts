import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const buildRecordInputFromFilter = (
  filter: RecordFilter,
  fieldMetadataItem: FieldMetadataItem,
) => {
  const value = buildValueFromFilter(filter, fieldMetadataItem);

  return value;
};

const stringToFieldMetadataType = (type: FieldMetadataType, value: string) => {
  switch (type) {
    case FieldMetadataType.UUID:
    case FieldMetadataType.TEXT:
    case FieldMetadataType.RICH_TEXT:
    case FieldMetadataType.FULL_NAME:
    case FieldMetadataType.RICH_TEXT_V2:
    case FieldMetadataType.RATING:
      return value;
    case FieldMetadataType.DATE_TIME:
    case FieldMetadataType.DATE:
      return new Date(value);
    case FieldMetadataType.NUMBER:
      return Number(value);
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return Number(value);
    case FieldMetadataType.BOOLEAN:
      return Boolean(value);
    case FieldMetadataType.RAW_JSON:
      return JSON.parse(value);
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.PHONES:
    case FieldMetadataType.EMAILS:
    case FieldMetadataType.LINKS:
    case FieldMetadataType.CURRENCY:
    case FieldMetadataType.TS_VECTOR:
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
    case FieldMetadataType.RELATION:
    case FieldMetadataType.ADDRESS:
    case FieldMetadataType.ACTOR:
      throw new Error('Type not supported');
    default:
      assertUnreachable(type);
  }
};

const buildValueFromFilter = (
  filter: RecordFilter,
  fieldMetadataItem: FieldMetadataItem,
) => {
  // check if it is a composite field
  if (isCompositeField(fieldMetadataItem.type)) {
    return filter.value;
  }

  // convert the value to the correct javascript type based on the fieldmetadataitem type
  const convertedValue = stringToFieldMetadataType(
    fieldMetadataItem.type,
    filter.value,
  );

  switch (filter.operand) {
    case ViewFilterOperand.Contains:
    case ViewFilterOperand.Is:
      return convertedValue;
    case ViewFilterOperand.IsNotEmpty: ///tododo
      return convertedValue;
    case ViewFilterOperand.IsNotNull: ///tododo
      return convertedValue;
    case ViewFilterOperand.LessThan:
      return Number(convertedValue) - 1;
    case ViewFilterOperand.GreaterThan:
      return Number(convertedValue) + 1;
    case ViewFilterOperand.IsBefore:
      return convertedValue;
    case ViewFilterOperand.IsAfter:
      return convertedValue;
    case ViewFilterOperand.IsInPast:
      return convertedValue;
    case ViewFilterOperand.IsInFuture:
      return convertedValue;
    case ViewFilterOperand.IsRelative:
    case ViewFilterOperand.IsToday:
      // get a date with this format "2025-04-22T07:45:00.000Z"
      // how to return a new string "2025-04-22T07:45:00.000Z"
      return new Date().toISOString();
    case ViewFilterOperand.DoesNotContain:
    case ViewFilterOperand.IsNot:
    case ViewFilterOperand.IsEmpty:
      return undefined;
  }
};
