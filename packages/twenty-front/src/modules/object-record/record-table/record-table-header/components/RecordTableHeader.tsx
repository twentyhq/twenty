import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderAddColumnButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderAddColumnButton';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderEmptyLastColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderEmptyLastColumn';
import { RecordTableHeaderFirstCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstCell';
import { RecordTableHeaderFirstScrollableCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstScrollableCell';
import { RecordTableHeaderLastEmptyColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastEmptyColumn';
import { RecordTableHeaderDroppableSlot } from '@/object-record/record-table/record-table-header/dnd/components/RecordTableHeaderDroppableSlot';
import { RecordTableHeaderDropTarget } from '@/object-record/record-table/record-table-header/dnd/components/RecordTableHeaderDropTarget';
import { RecordTableHeaderSortableCell } from '@/object-record/record-table/record-table-header/dnd/components/RecordTableHeaderSortableCell';
import { RecordTableHeaderDndKitProvider } from '@/object-record/record-table/record-table-header/dnd/providers/RecordTableHeaderDndKitProvider';
import { useResizeTableHeader } from '@/object-record/record-table/record-table-header/hooks/useResizeTableHeader';
import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import React from 'react';
import { filterOutByProperty } from 'twenty-shared/utils';

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: sticky;
  top: 0;
  z-index: ${TABLE_Z_INDEX.headerRow};
`;

export const RecordTableHeader = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const isRecordTableColumnHeadersReadOnly = useAtomComponentStateValue(
    isRecordTableColumnHeadersReadOnlyComponentState,
  );

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden = useAtomComponentStateValue(
    isRecordTableCheckboxColumnHiddenComponentState,
  );

  const recordFieldsWithoutLabelIdentifier = visibleRecordFields.filter(
    filterOutByProperty(
      'fieldMetadataItemId',
      labelIdentifierFieldMetadataItem?.id,
    ),
  );

  const recordFieldsWithoutLabelIdentifierAndFirstOne =
    recordFieldsWithoutLabelIdentifier.slice(1);

  useResizeTableHeader();

  return (
    <StyledHeaderContainer>
      {!isRecordTableDragColumnHidden && <RecordTableHeaderDragDropColumn />}
      {!isRecordTableCheckboxColumnHidden && (
        <RecordTableHeaderCheckboxColumn />
      )}
      <RecordTableHeaderFirstCell />

      <RecordTableHeaderDndKitProvider>
        {/* Drop target just after 1st cell */}
        <RecordTableHeaderDroppableSlot
          droppableId={'record-table-header-droppable'}
          index={0}
          disabled={isRecordTableColumnHeadersReadOnly}
        >
          <RecordTableHeaderDropTarget index={0} compact />
        </RecordTableHeaderDroppableSlot>

        <RecordTableHeaderSortableCell
          id={recordFieldsWithoutLabelIdentifier[0].fieldMetadataItemId}
          index={0}
          group={'record-table-header-droppable'}
          disabled={isRecordTableColumnHeadersReadOnly}
        >
          <RecordTableHeaderFirstScrollableCell />
        </RecordTableHeaderSortableCell>

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
    </StyledHeaderContainer>
  );
};
