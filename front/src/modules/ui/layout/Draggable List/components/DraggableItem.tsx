import React from 'react';
import { useTheme } from '@emotion/react';
import { Draggable } from '@hello-pangea/dnd';

type DraggableItemProps = {
  draggableId: string;
  isDragDisabled?: boolean;
  index: number;
  itemComponent: JSX.Element;
};

export const DraggableItem = ({
  draggableId,
  isDragDisabled = false,
  index,
  itemComponent,
}: DraggableItemProps) => {
  const theme = useTheme();
  return (
    <Draggable
      key={draggableId}
      draggableId={draggableId}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(draggableProvided, draggableSnapshot) => {
        const draggableStyle = draggableProvided.draggableProps.style;
        const isDragged = draggableSnapshot.isDragging;
        return (
          <div
            ref={draggableProvided.innerRef}
            {...{
              ...draggableProvided.draggableProps,
              style: {
                ...draggableStyle,
                left: 'auto',
                top: 'auto',
                transform: draggableStyle?.transform?.replace(
                  /\(-?\d+px,/,
                  '(0,',
                ),
                background: isDragged
                  ? theme.background.transparent.light
                  : 'none',
              },
            }}
            {...draggableProvided.dragHandleProps}
          >
            {itemComponent}
          </div>
        );
      }}
    </Draggable>
  );
};
