import { useRecordDragState } from '@/object-record/record-drag/shared/hooks/useRecordDragState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellDragAndDrop } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDragAndDrop';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTablePlusButtonCellPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTablePlusButtonCellPlaceholder';
import { RecordTableCells } from '@/object-record/record-table/record-table-row/components/RecordTableCells';
import { RecordTableRowMultiDragPreview } from '@/object-record/record-table/record-table-row/components/RecordTableRowMultiDragPreview';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useTheme } from '@emotion/react';
import {
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableBodyVirtualizedDraggableClone = ({
  draggableProvided,
  draggableSnapshot,
  rubric,
}: {
  draggableProvided: DraggableProvided;
  draggableSnapshot: DraggableStateSnapshot;
  rubric: DraggableRubric;
}) => {
  const realIndex = rubric.source.index;

  const { recordTableId } = useRecordTableContextOrThrow();

  const multiDragState = useRecordDragState('table', recordTableId);

  const theme = useTheme();

  const recordId = useRecoilComponentFamilyValue(
    recordIdByRealIndexComponentFamilyState,
    { realIndex },
  );

  if (!isDefined(recordId)) {
    return null;
  }

  const isSecondaryDragged =
    multiDragState?.isDragging &&
    multiDragState.originalSelection.includes(recordId) &&
    recordId !== multiDragState.primaryDraggedRecordId;

  return (
    <>
      <RecordTableTr
        recordId={recordId}
        focusIndex={realIndex}
        ref={draggableProvided.innerRef}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...draggableProvided.draggableProps}
        style={{
          ...draggableProvided.draggableProps.style,
          background: draggableSnapshot.isDragging
            ? theme.background.transparent.light
            : undefined,
          borderColor: draggableSnapshot.isDragging
            ? `${theme.border.color.medium}`
            : 'transparent',
          opacity: isSecondaryDragged ? 0.3 : undefined,
        }}
        isDragging={draggableSnapshot.isDragging}
        data-testid={`row-id-${recordId}`}
        data-virtualized-id={recordId}
        data-selectable-id={recordId}
        onClick={() => {}}
        isFirstRowOfGroup={false}
      >
        <RecordTableRowDraggableContextProvider
          value={{
            isDragging: draggableSnapshot.isDragging,
            dragHandleProps: draggableProvided.dragHandleProps,
          }}
        >
          <RecordTableCellDragAndDrop />
          <RecordTableCellCheckbox />
          <RecordTableCells />
          <RecordTablePlusButtonCellPlaceholder />
          <RecordTableLastEmptyCell />
          <RecordTableRowMultiDragPreview
            isDragging={draggableSnapshot.isDragging}
          />
        </RecordTableRowDraggableContextProvider>
      </RecordTableTr>
    </>
  );
};
