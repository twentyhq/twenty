import { useTheme } from '@emotion/react';
import { Draggable, DraggableId } from '@hello-pangea/dnd';
import { forwardRef, ReactNode } from 'react';

import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { combineRefs } from '~/utils/combineRefs';

type RecordTableDraggableTrProps = {
  className?: string;
  draggableId: DraggableId;
  draggableIndex: number;
  isDragDisabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  children: ReactNode;
};

export const RecordTableDraggableTr = forwardRef<
  HTMLTableRowElement,
  RecordTableDraggableTrProps
>(
  (
    {
      className,
      draggableId,
      draggableIndex,
      isDragDisabled,
      onClick,
      children,
    },
    ref,
  ) => {
    const theme = useTheme();

    return (
      <Draggable
        draggableId={draggableId}
        index={draggableIndex}
        isDragDisabled={isDragDisabled}
      >
        {(draggableProvided, draggableSnapshot) => (
          <RecordTableTr
            ref={combineRefs<HTMLTableRowElement>(
              ref,
              draggableProvided.innerRef,
            )}
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
            }}
            isDragging={draggableSnapshot.isDragging}
            data-testid={`row-id-${draggableId}`}
            data-selectable-id={draggableId}
            onClick={onClick}
          >
            <RecordTableRowDraggableContextProvider
              value={{
                isDragging: draggableSnapshot.isDragging,
                dragHandleProps: draggableProvided.dragHandleProps,
              }}
            >
              {children}
            </RecordTableRowDraggableContextProvider>
          </RecordTableTr>
        )}
      </Draggable>
    );
  },
);
