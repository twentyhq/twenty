import React from 'react';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderAddColumnButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderAddColumnButton';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderEmptyLastColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderEmptyLastColumn';
import { RecordTableHeaderFirstScrollableCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstScrollableCell';
import { RecordTableHeaderLastEmptyColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastEmptyColumn';
import { RecordTableHeaderDroppableSlot } from '@/object-record/record-table/record-table-header/dnd/components/RecordTableHeaderDroppableSlot';
import { RecordTableHeaderDropTarget } from '@/object-record/record-table/record-table-header/dnd/components/RecordTableHeaderDropTarget';
import { RecordTableHeaderSortableCell } from '@/object-record/record-table/record-table-header/dnd/components/RecordTableHeaderSortableCell';
import { RecordTableHeaderDndKitProvider } from '@/object-record/record-table/record-table-header/dnd/providers/RecordTableHeaderDndKitProvider';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
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
      {/* Drop target just after 1st cell */}
      <RecordTableHeaderDroppableSlot
        droppableId={'record-table-header-droppable'}
        index={0}
        disabled={isRecordTableColumnHeadersReadOnly}
      >
        <RecordTableHeaderDropTarget index={0} compact />
      </RecordTableHeaderDroppableSlot>

      {isDefined(firstScrollableRecordField) ? (
        <RecordTableHeaderSortableCell
          key={firstScrollableRecordField.fieldMetadataItemId}
          id={firstScrollableRecordField.fieldMetadataItemId}
          index={0}
          group={'record-table-header-droppable'}
          disabled={isRecordTableColumnHeadersReadOnly}
        >
          <RecordTableHeaderFirstScrollableCell
            firstScrollableRecordField={firstScrollableRecordField}
          />
        </RecordTableHeaderSortableCell>
      ) : (
        <></>
      )}

      {recordFieldsWithoutFirstTwo.map((recordField, index) => (
        <React.Fragment key={recordField.fieldMetadataItemId}>
          {/* Drop target just before all visible cells */}
          <RecordTableHeaderDroppableSlot
            droppableId={'record-table-header-droppable'}
            index={index + 1}
            disabled={isRecordTableColumnHeadersReadOnly}
          >
            <RecordTableHeaderDropTarget index={index + 1} compact />
          </RecordTableHeaderDroppableSlot>
          <RecordTableHeaderSortableCell
            id={recordField.fieldMetadataItemId}
            index={index + 1}
            group={'record-table-header-droppable'}
            disabled={isRecordTableColumnHeadersReadOnly}
          >
            <RecordTableHeaderCell
              key={recordField.fieldMetadataItemId}
              recordField={recordField}
              recordFieldIndex={index + 2}
            />
          </RecordTableHeaderSortableCell>
        </React.Fragment>
      ))}
      {/* Drop target just after last cell */}
      <RecordTableHeaderDroppableSlot
        droppableId={'record-table-header-droppable'}
        index={visibleRecordFields.length}
        disabled={isRecordTableColumnHeadersReadOnly}
      >
        <RecordTableHeaderDropTarget
          index={visibleRecordFields.length}
          compact
        />
      </RecordTableHeaderDroppableSlot>
      {isRecordTableColumnHeadersReadOnly ? (
        <RecordTableHeaderEmptyLastColumn />
      ) : (
        <RecordTableHeaderAddColumnButton />
      )}
      <RecordTableHeaderLastEmptyColumn />
    </RecordTableHeaderDndKitProvider>
  );
};
