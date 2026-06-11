import React from 'react';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
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
import { filterOutByProperty, isDefined } from 'twenty-shared/utils';

export const RecordTableHeaderDnd = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const isRecordTableColumnHeadersReadOnly = useAtomComponentStateValue(
    isRecordTableColumnHeadersReadOnlyComponentState,
  );

  const recordFieldsWithoutLabelIdentifier = visibleRecordFields.filter(
    filterOutByProperty(
      'fieldMetadataItemId',
      labelIdentifierFieldMetadataItem?.id,
    ),
  );

  const firstScrollableRecordField = recordFieldsWithoutLabelIdentifier[0];

  const recordFieldsWithoutLabelIdentifierAndFirstOne =
    recordFieldsWithoutLabelIdentifier.slice(1);

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

      {recordFieldsWithoutLabelIdentifierAndFirstOne.map(
        (recordField, index) => (
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
        ),
      )}
      {/* Drop target just after last cell */}
      <RecordTableHeaderDroppableSlot
        droppableId={'record-table-header-droppable'}
        index={recordFieldsWithoutLabelIdentifier.length}
        disabled={isRecordTableColumnHeadersReadOnly}
      >
        <RecordTableHeaderDropTarget
          index={recordFieldsWithoutLabelIdentifier.length}
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
