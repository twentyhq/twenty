import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined } from 'twenty-shared/utils';

export const getVisibleFieldWithLowestPosition = (
  visibleRecordFields: RecordField[],
) => {
  return visibleRecordFields.reduce<RecordField | undefined>(
    (lowestPositionField, currentField) =>
      !isDefined(lowestPositionField) ||
      currentField.position < lowestPositionField.position
        ? currentField
        : lowestPositionField,
    undefined,
  );
};
