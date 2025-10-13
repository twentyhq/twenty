import { useTheme } from '@emotion/react';
import { Draggable } from '@hello-pangea/dnd';
import { type ReactNode } from 'react';

import { useRecordDragState } from '@/object-record/record-drag/shared/hooks/useRecordDragState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableRowMultiDragPreview } from '@/object-record/record-table/record-table-row/components/RecordTableRowMultiDragPreview';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';

type RecordTableDraggableTrProps = {
  className?: string;
  recordId: string;
  draggableIndex: number;
  focusIndex: number;
  isDragDisabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  children: ReactNode;
};

export const RecordTableDraggableTr = ({
  className,
  recordId,
  draggableIndex,
  focusIndex,
  isDragDisabled,
  onClick,
  children,
}: RecordTableDraggableTrProps) => {
  const theme = useTheme();
  const { recordTableId } = useRecordTableContextOrThrow();
  const multiDragState = useRecordDragState('table', recordTableId);

  const isSecondaryDragged =
    multiDragState?.isDragging &&
    multiDragState.originalSelection.includes(recordId) &&
    recordId !== multiDragState.primaryDraggedRecordId;

  return (
    <Draggable
      draggableId={recordId}
      index={draggableIndex}
      isDragDisabled={isDragDisabled}
    >
      {(draggableProvided, draggableSnapshot) => (
        <>
          <RecordTableTr
            recordId={recordId}
            focusIndex={focusIndex}
            ref={draggableProvided.innerRef}
            className={className}
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
            onClick={onClick}
            isFirstRowOfGroup={false}
          >
            <RecordTableRowDraggableContextProvider
              value={{
                isDragging: draggableSnapshot.isDragging,
                dragHandleProps: draggableProvided.dragHandleProps,
              }}
            >
              {children}
              <RecordTableRowMultiDragPreview
                isDragging={draggableSnapshot.isDragging}
              />
            </RecordTableRowDraggableContextProvider>
          </RecordTableTr>
        </>
      )}
    </Draggable>
  );
};
