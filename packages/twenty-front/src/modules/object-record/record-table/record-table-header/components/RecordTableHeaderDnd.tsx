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
import { DragDropColumnDroppableSlot } from '@/ui/utilities/drag-and-drop/components/DragDropColumnDroppableSlot';
import { DragDropColumnDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropColumnDropTarget';
import { DragDropColumnSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropColumnSortableCell';
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
      <DragDropColumnDroppableSlot
        droppableId={RECORD_TABLE_HEADER_DROPPABLE_ID}
        index={0}
        disabled={isRecordTableColumnHeadersReadOnly}
      >
        <DragDropColumnDropTarget index={0} compact />
      </DragDropColumnDroppableSlot>

      {isDefined(firstScrollableRecordField) && (
        <DragDropColumnSortableCell
          key={firstScrollableRecordField.fieldMetadataItemId}
          id={firstScrollableRecordField.fieldMetadataItemId}
          index={0}
          group={RECORD_TABLE_HEADER_DROPPABLE_ID}
          disabled={isRecordTableColumnHeadersReadOnly}
        >
          <RecordTableHeaderFirstScrollableCell
            firstScrollableRecordField={firstScrollableRecordField}
          />
        </DragDropColumnSortableCell>
      )}

      {recordFieldsWithoutFirstTwo.map((recordField, index) => (
        <React.Fragment key={recordField.fieldMetadataItemId}>
          <DragDropColumnDroppableSlot
            droppableId={RECORD_TABLE_HEADER_DROPPABLE_ID}
            index={index + 1}
            disabled={isRecordTableColumnHeadersReadOnly}
          >
            <DragDropColumnDropTarget index={index + 1} compact />
          </DragDropColumnDroppableSlot>
          <DragDropColumnSortableCell
            id={recordField.fieldMetadataItemId}
            index={index + 1}
            group={RECORD_TABLE_HEADER_DROPPABLE_ID}
            disabled={isRecordTableColumnHeadersReadOnly}
          >
            <RecordTableHeaderCell
              key={recordField.fieldMetadataItemId}
              recordField={recordField}
              recordFieldIndex={index + 2}
            />
          </DragDropColumnSortableCell>
        </React.Fragment>
      ))}
      <DragDropColumnDroppableSlot
        droppableId={RECORD_TABLE_HEADER_DROPPABLE_ID}
        index={visibleRecordFields.length - 1}
        disabled={isRecordTableColumnHeadersReadOnly}
      >
        <DragDropColumnDropTarget
          index={visibleRecordFields.length - 1}
          compact
        />
      </DragDropColumnDroppableSlot>
      {isRecordTableColumnHeadersReadOnly ? (
        <RecordTableHeaderEmptyLastColumn />
      ) : (
        <RecordTableHeaderAddColumnButton />
      )}
      <RecordTableHeaderLastEmptyColumn />
    </RecordTableHeaderDndKitProvider>
  );
};
