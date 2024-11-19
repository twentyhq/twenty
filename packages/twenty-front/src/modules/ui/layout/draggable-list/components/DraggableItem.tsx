import { useTheme } from '@emotion/react';
import { Draggable } from '@hello-pangea/dnd';

type DraggableItemProps = {
  draggableId: string;
  isDragDisabled?: boolean;
  index: number;
  itemComponent: JSX.Element;
  isInsideScrollableContainer?: boolean;
};

export const DraggableItem = ({
  draggableId,
  isDragDisabled = false,
  index,
  itemComponent,
  isInsideScrollableContainer,
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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.draggableProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.dragHandleProps}
            style={{
              ...draggableStyle,
              left: 'auto',
              ...(isInsideScrollableContainer ? {} : { top: 'auto' }),
              transform: draggableStyle?.transform?.replace(
                /\(-?\d+px,/,
                '(0,',
              ),
              background: isDragged
                ? theme.background.transparent.light
                : 'none',
            }}
          >
            {itemComponent}
          </div>
        );
      }}
    </Draggable>
  );
};
