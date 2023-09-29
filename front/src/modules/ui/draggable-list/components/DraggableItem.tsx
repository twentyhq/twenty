import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

type DraggableItemProps = {
  key: string;
  draggableId: string;
  isDragDisabled?: boolean;
  index: number;
  itemsComponent: JSX.Element;
};

export const DraggableItem = ({
  key,
  draggableId,
  isDragDisabled = false,
  index,
  itemsComponent,
}: DraggableItemProps) => {
  return (
    <Draggable
      key={key}
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
              },
            }}
            {...draggableProvided.dragHandleProps}
          >
            {React.cloneElement(itemsComponent, { isDragged })}
          </div>
        );
      }}
    </Draggable>
  );
};
