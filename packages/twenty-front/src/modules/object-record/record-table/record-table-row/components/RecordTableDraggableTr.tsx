import { useTheme } from '@emotion/react';
import {
  Draggable,
  DraggableId,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { forwardRef, ReactNode } from 'react';

import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { mergeRefs } from '~/utils/mergeRefs';

type RecordTableDraggableTrProps = {
  draggableId: DraggableId;
  draggableIndex: number;
  isDragDisabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  children:
    | ReactNode
    | ((
        provided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
      ) => ReactNode);
};

export const RecordTableDraggableTr = forwardRef<
  HTMLTableRowElement,
  RecordTableDraggableTrProps
>(({ draggableId, draggableIndex, isDragDisabled, onClick, children }, ref) => {
  const theme = useTheme();

  return (
    <Draggable
      draggableId={draggableId}
      index={draggableIndex}
      isDragDisabled={isDragDisabled}
    >
      {(draggableProvided, draggableSnapshot) => (
        <RecordTableTr
          ref={mergeRefs<HTMLTableRowElement>(ref, draggableProvided.innerRef)}
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
          {typeof children === 'function'
            ? children(draggableProvided, draggableSnapshot)
            : children}
        </RecordTableTr>
      )}
    </Draggable>
  );
});
