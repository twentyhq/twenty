import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type RecordTableColumnRange } from '@/object-record/record-table/virtualization/types/RecordTableColumnRange';
import { type RecordTableColumnVirtualizationItem } from '@/object-record/record-table/virtualization/types/RecordTableColumnVirtualizationItem';
import { isRecordTableColumnRendered } from '@/object-record/record-table/virtualization/utils/isRecordTableColumnRendered';

export const computeRecordTableColumnVirtualizationItems = ({
  visibleRecordFields,
  renderedColumnRange,
  columnIndexesRenderedOutsideRange,
}: {
  visibleRecordFields: Pick<RecordField, 'size'>[];
  renderedColumnRange: RecordTableColumnRange | null;
  columnIndexesRenderedOutsideRange: number[];
}): RecordTableColumnVirtualizationItem[] => {
  const items: RecordTableColumnVirtualizationItem[] = [];

  for (
    let columnIndex = 1;
    columnIndex < visibleRecordFields.length;
    columnIndex++
  ) {
    if (
      isRecordTableColumnRendered({
        columnIndex,
        renderedColumnRange,
        columnIndexesRenderedOutsideRange,
      })
    ) {
      items.push({ type: 'column', columnIndex });
      continue;
    }

    const columnWidth = visibleRecordFields[columnIndex].size;
    const lastItem = items.at(-1);

    if (lastItem?.type === 'spacer') {
      lastItem.width += columnWidth;
    } else {
      items.push({
        type: 'spacer',
        firstColumnIndex: columnIndex,
        width: columnWidth,
      });
    }
  }

  return items;
};
