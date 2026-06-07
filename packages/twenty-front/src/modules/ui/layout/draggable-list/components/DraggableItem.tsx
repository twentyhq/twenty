import { styled } from '@linaria/react';
import { Draggable } from '@hello-pangea/dnd';
import { isFunction } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type DraggableItemProps = {
  draggableId: string;
  isDragDisabled?: boolean;
  disableInteractiveElementBlocking?: boolean;
  index: number;
  itemComponent:
    | JSX.Element
    | ((props: { isDragging: boolean }) => JSX.Element);
  isInsideScrollableContainer?: boolean;
  draggableComponentStyles?: React.CSSProperties;
  disableDraggingBackground?: boolean;
  containerOffsetY?: number;
};

const StyledInnerDraggableContainer = styled.div<{ index: number }>`
  margin-top: ${({ index }) =>
    index !== 0 ? themeCssVariables.betweenSiblingsGap : 0};
`;

export const DraggableItem = ({
  draggableId,
  isDragDisabled = false,
  disableInteractiveElementBlocking = false,
  index,
  itemComponent,
  isInsideScrollableContainer,
  draggableComponentStyles,
  disableDraggingBackground,
  containerOffsetY,
}: DraggableItemProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <Draggable
      key={draggableId}
      draggableId={draggableId}
      index={index}
      isDragDisabled={isDragDisabled}
      disableInteractiveElementBlocking={disableInteractiveElementBlocking}
    >
      {(draggableProvided, draggableSnapshot) => {
        const draggableStyle = draggableProvided.draggableProps.style;
        const isDragging = draggableSnapshot.isDragging;

        return (
          <StyledInnerDraggableContainer
            ref={draggableProvided.innerRef}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.draggableProps}
            // oxlint-disable-next-line react/jsx-props-no-spreading
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
            index={index}
          >
            {isFunction(itemComponent)
              ? itemComponent({
                  isDragging,
                })
              : itemComponent}
          </StyledInnerDraggableContainer>
        );
      }}
    </Draggable>
  );
};
