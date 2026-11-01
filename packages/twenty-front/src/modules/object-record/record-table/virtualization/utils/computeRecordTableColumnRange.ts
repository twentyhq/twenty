import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type RecordTableColumnRange } from '@/object-record/record-table/virtualization/types/RecordTableColumnRange';

export const computeRecordTableColumnRange = ({
  visibleRecordFields,
  visibleStartPosition,
  visibleEndPosition,
}: {
  visibleRecordFields: Pick<RecordField, 'size'>[];
  visibleStartPosition: number;
  visibleEndPosition: number;
}): RecordTableColumnRange => {
  const lastColumnIndex = visibleRecordFields.length - 1;

  if (lastColumnIndex < 1) {
    return { startColumnIndex: 1, endColumnIndex: 0 };
  }

  let startColumnIndex = 1;
  let columnEndPosition =
    visibleRecordFields[0].size + visibleRecordFields[1].size;

  while (
    startColumnIndex < lastColumnIndex &&
    columnEndPosition <= visibleStartPosition
  ) {
    startColumnIndex++;
    columnEndPosition += visibleRecordFields[startColumnIndex].size;
  }

  let endColumnIndex = startColumnIndex;

  while (
    endColumnIndex < lastColumnIndex &&
    columnEndPosition < visibleEndPosition
  ) {
    endColumnIndex++;
    columnEndPosition += visibleRecordFields[endColumnIndex].size;
  }

  return { startColumnIndex, endColumnIndex };
};
