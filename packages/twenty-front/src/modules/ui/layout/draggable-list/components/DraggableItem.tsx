import { useTheme } from '@emotion/react';
import { Draggable } from '@hello-pangea/dnd';
import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type DraggableItemProps = {
  draggableId: string;
  isDragDisabled?: boolean;
  index: number;
  itemComponent:
    | JSX.Element
    | ((props: { isDragging: boolean }) => JSX.Element);
  isInsideScrollableContainer?: boolean;
  draggableComponentStyles?: React.CSSProperties;
  disableDraggingBackground?: boolean;
  containerOffsetY?: number;
};

export const DraggableItem = ({
  draggableId,
  isDragDisabled = false,
  index,
  itemComponent,
  isInsideScrollableContainer,
  draggableComponentStyles,
  disableDraggingBackground,
  containerOffsetY,
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
        const isDragging = draggableSnapshot.isDragging;

        return (
          <div
            ref={draggableProvided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.draggableProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.dragHandleProps}
            style={{
              ...draggableComponentStyles,
              ...draggableStyle,
              left: 'auto',
              transform: draggableStyle?.transform?.replace(
                /\(-?\d+px,/,
                '(0,',
              ),
              ...(isInsideScrollableContainer
                ? {
                    top: `${(isDefined(draggableStyle) && 'top' in draggableStyle ? draggableStyle.top : 0) - (containerOffsetY ?? 0)}px`,
                  }
                : { top: 'auto' }),
              background:
                !disableDraggingBackground && isDragging
                  ? theme.background.transparent.light
                  : 'none',
            }}
          >
            {isFunction(itemComponent)
              ? itemComponent({
                  isDragging,
                })
              : itemComponent}
          </div>
        );
      }}
    </Draggable>
  );
};
