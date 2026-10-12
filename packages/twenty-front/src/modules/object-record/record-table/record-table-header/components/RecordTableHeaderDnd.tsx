import React from 'react';

import { closestCenter } from '@dnd-kit/collision';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderAddColumnButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderAddColumnButton';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderEmptyLastColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderEmptyLastColumn';
import { RecordTableHeaderLastEmptyColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastEmptyColumn';
import { RECORD_TABLE_HEADER_DROPPABLE_ID } from '@/object-record/record-table/record-table-header/dnd/constants/RecordTableHeaderDroppableId';
import { RecordTableHeaderDndKitProvider } from '@/object-record/record-table/record-table-header/dnd/providers/RecordTableHeaderDndKitProvider';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DragDropItemDropTargetSlot } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTargetSlot';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordTableHeaderDnd = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const isRecordTableColumnHeadersReadOnly = useAtomComponentStateValue(
    isRecordTableColumnHeadersReadOnlyComponentState,
  );

  const scrollableRecordFields = visibleRecordFields.slice(1);

  return (
    <RecordTableHeaderDndKitProvider>
      {scrollableRecordFields.map((recordField, index) => (
        <React.Fragment key={recordField.fieldMetadataItemId}>
          <DragDropItemDropTargetSlot>
            <DragDropItemDropTarget
              index={index}
              orientation="vertical"
              compact
            />
          </DragDropItemDropTargetSlot>
          <DragDropItemSortableCell
            id={recordField.fieldMetadataItemId}
            index={index}
            group={RECORD_TABLE_HEADER_DROPPABLE_ID}
            disabled={isRecordTableColumnHeadersReadOnly}
            restrictMovementTo="x"
            collisionDetector={closestCenter}
          >
            <RecordTableHeaderCell
              key={recordField.fieldMetadataItemId}
              recordField={recordField}
              recordFieldIndex={index + 1}
            />
          </DragDropItemSortableCell>
        </React.Fragment>
      ))}
      <DragDropItemDropTargetSlot>
        <DragDropItemDropTarget
          index={visibleRecordFields.length - 1}
          orientation="vertical"
          compact
        />
      </DragDropItemDropTargetSlot>
      {isRecordTableColumnHeadersReadOnly ? (
        <RecordTableHeaderEmptyLastColumn />
      ) : (
        <RecordTableHeaderAddColumnButton />
      )}
      <RecordTableHeaderLastEmptyColumn />
    </RecordTableHeaderDndKitProvider>
  );
};
