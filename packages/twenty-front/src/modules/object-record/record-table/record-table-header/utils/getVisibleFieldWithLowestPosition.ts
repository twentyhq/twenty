import { type RecordField } from '@/object-record/record-field/types/RecordField';

export const getVisibleFieldWithLowestPosition = (
  visibleRecordFields: RecordField[],
) => {
  if (visibleRecordFields.length === 0) {
    return undefined;
  }
  return visibleRecordFields.reduce((lowestPositionField, currentField) => {
    if (currentField?.position < lowestPositionField?.position) {
      return currentField;
    }
    return lowestPositionField;
  }, visibleRecordFields[0]);
};
