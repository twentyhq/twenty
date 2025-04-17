import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const buildRecordInputFromFilter = (
  filter: RecordFilter,
  fieldMetadataItem: FieldMetadataItem,
) => {
  const value = buildValueFromFilter(filter, fieldMetadataItem);

  return value;
};

const buildValueFromFilter = (
  filter: RecordFilter,
  fieldMetadataItem: FieldMetadataItem,
) => {
  // check if it is a composite field

  switch (filter.operand) {
    case ViewFilterOperand.Contains:
    case ViewFilterOperand.Is:
      return filter.value;
    case ViewFilterOperand.IsNotEmpty: ///tododo
      return filter.value;
    case ViewFilterOperand.IsNotNull: ///tododo
      return filter.value;
    case ViewFilterOperand.LessThan:
      return Number(filter.value) - 1;
    case ViewFilterOperand.GreaterThan:
      return Number(filter.value) + 1;
    case ViewFilterOperand.IsBefore:
      return filter.value;
    case ViewFilterOperand.IsAfter:
      return filter.value;
    case ViewFilterOperand.IsInPast:
      return filter.value;
    case ViewFilterOperand.IsInFuture:
      return filter.value;
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
