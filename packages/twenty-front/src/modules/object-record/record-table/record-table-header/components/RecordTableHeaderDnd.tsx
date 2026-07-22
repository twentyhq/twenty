import React from 'react';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderAddColumnButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderAddColumnButton';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderEmptyLastColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderEmptyLastColumn';
import { RecordTableHeaderFirstScrollableCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstScrollableCell';
import { RecordTableHeaderLastEmptyColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastEmptyColumn';
import { RECORD_TABLE_HEADER_DROPPABLE_ID } from '@/object-record/record-table/record-table-header/dnd/constants/RecordTableHeaderDroppableId';
import { RecordTableHeaderDndKitProvider } from '@/object-record/record-table/record-table-header/dnd/providers/RecordTableHeaderDndKitProvider';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { DragDropItemDroppableSlot } from '@/ui/utilities/drag-and-drop/components/DragDropItemDroppableSlot';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableHeaderDnd = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const isRecordTableColumnHeadersReadOnly = useAtomComponentStateValue(
    isRecordTableColumnHeadersReadOnlyComponentState,
  );

  const firstScrollableRecordField = visibleRecordFields[1];

  const recordFieldsWithoutFirstTwo = visibleRecordFields.slice(2);

  return (
    <RecordTableHeaderDndKitProvider>
      <DragDropItemDroppableSlot
        droppableId={RECORD_TABLE_HEADER_DROPPABLE_ID}
        index={0}
        disabled={isRecordTableColumnHeadersReadOnly}
      >
        <DragDropItemDropTarget index={0} orientation="vertical" compact />
      </DragDropItemDroppableSlot>

      {isDefined(firstScrollableRecordField) && (
        <DragDropItemSortableCell
          key={firstScrollableRecordField.fieldMetadataItemId}
          id={firstScrollableRecordField.fieldMetadataItemId}
          index={0}
          group={RECORD_TABLE_HEADER_DROPPABLE_ID}
          disabled={isRecordTableColumnHeadersReadOnly}
          restrictMovementTo="x"
        >
          <RecordTableHeaderFirstScrollableCell
            firstScrollableRecordField={firstScrollableRecordField}
          />
        </DragDropItemSortableCell>
      )}

      {recordFieldsWithoutFirstTwo.map((recordField, index) => (
        <React.Fragment key={recordField.fieldMetadataItemId}>
          <DragDropItemDroppableSlot
            droppableId={RECORD_TABLE_HEADER_DROPPABLE_ID}
            index={index + 1}
            disabled={isRecordTableColumnHeadersReadOnly}
          >
            <DragDropItemDropTarget
              index={index + 1}
              orientation="vertical"
              compact
            />
          </DragDropItemDroppableSlot>
          <DragDropItemSortableCell
            id={recordField.fieldMetadataItemId}
            index={index + 1}
            group={RECORD_TABLE_HEADER_DROPPABLE_ID}
            disabled={isRecordTableColumnHeadersReadOnly}
            restrictMovementTo="x"
          >
            <RecordTableHeaderCell
              key={recordField.fieldMetadataItemId}
              recordField={recordField}
              recordFieldIndex={index + 2}
            />
          </DragDropItemSortableCell>
        </React.Fragment>
      ))}
      <DragDropItemDroppableSlot
        droppableId={RECORD_TABLE_HEADER_DROPPABLE_ID}
        index={visibleRecordFields.length - 1}
        disabled={isRecordTableColumnHeadersReadOnly}
      >
        <DragDropItemDropTarget
          index={visibleRecordFields.length - 1}
          orientation="vertical"
          compact
        />
      </DragDropItemDroppableSlot>
      {isRecordTableColumnHeadersReadOnly ? (
        <RecordTableHeaderEmptyLastColumn />
      ) : (
        <RecordTableHeaderAddColumnButton />
      )}
      <RecordTableHeaderLastEmptyColumn />
    </RecordTableHeaderDndKitProvider>
  );
};
