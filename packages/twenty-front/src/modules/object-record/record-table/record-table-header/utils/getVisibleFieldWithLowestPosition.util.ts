import { type RecordField } from '@/object-record/record-field/types/RecordField';

export const getVisibleFieldWithLowestPosition = (
  visibleRecordFields: RecordField[],
) => {
  return visibleRecordFields.reduce((lowestPositionField, currentField) => {
    if (currentField.position < lowestPositionField.position) {
      return currentField;
    }
    return lowestPositionField;
  }, visibleRecordFields[0]);
};
