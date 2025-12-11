import { useTheme } from '@emotion/react';
import { Draggable } from '@hello-pangea/dnd';
import { type ReactNode } from 'react';

import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableRowMultiDragPreview } from '@/object-record/record-table/record-table-row/components/RecordTableRowMultiDragPreview';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { useIsTableRowSecondaryDragged } from '@/object-record/record-table/record-table-row/hooks/useIsRecordSecondaryDragged';

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

  const { isSecondaryDragged } = useIsTableRowSecondaryDragged(recordId);

  return (
    <Draggable
      key={recordId}
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
              <RecordTableRowMultiDragPreview />
            </RecordTableRowDraggableContextProvider>
          </RecordTableTr>
        </>
      )}
    </Draggable>
  );
};
