import { useTheme } from '@emotion/react';
import { Draggable, DraggableId } from '@hello-pangea/dnd';
import { ReactNode } from 'react';

import { RecordTableRowDraggableContext } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';

type RecordTableDraggableTrProps = {
  draggableId: DraggableId;
  draggableIndex: number;
  isDragDisabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  children: ReactNode;
};

export const RecordTableDraggableTr = ({
  draggableId,
  draggableIndex,
  isDragDisabled,
  onClick,
  children,
}: RecordTableDraggableTrProps) => {
  const theme = useTheme();

  return (
    <Draggable
      draggableId={draggableId}
      index={draggableIndex}
      isDragDisabled={isDragDisabled}
    >
      {(draggableProvided, draggableSnapshot) => (
        <RecordTableTr
          ref={draggableProvided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.draggableProps}
          style={{
            ...draggableProvided.draggableProps.style,
            background: draggableSnapshot.isDragging
              ? theme.background.transparent.light
              : 'none',
            borderColor: draggableSnapshot.isDragging
              ? `${theme.border.color.medium}`
              : 'transparent',
          }}
          isDragging={draggableSnapshot.isDragging}
          data-testid={`row-id-${draggableId}`}
          data-selectable-id={draggableId}
          onClick={onClick}
        >
          <RecordTableRowDraggableContext.Provider
            value={{
              isDragging: draggableSnapshot.isDragging,
              dragHandleProps: draggableProvided.dragHandleProps,
            }}
          >
            {children}
          </RecordTableRowDraggableContext.Provider>
        </RecordTableTr>
      )}
    </Draggable>
  );
};
