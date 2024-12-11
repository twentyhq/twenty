import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';

type DroppableListProps = {
  droppableId: string;
  children: React.ReactNode;
  isDragIndicatorVisible?: boolean;
};

const StyledDroppableWrapper = styled.div<{
  isDraggingOver: boolean;
  isDragIndicatorVisible: boolean;
}>`
  position: relative;
  transition: all 150ms ease-in-out;

  ${({ isDraggingOver, isDragIndicatorVisible, theme }) =>
    isDraggingOver &&
    isDragIndicatorVisible &&
    `
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: ${theme.color.blue};
        border-radius: ${theme.border.radius.sm} ${theme.border.radius.sm} 0 0;
      }
      
      background-color: ${theme.background.transparent.lighter};
    `}

  width: 100%;
`;

export const DroppableList = ({
  droppableId,
  children,
  isDragIndicatorVisible = true,
}: DroppableListProps) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <StyledDroppableWrapper
          isDraggingOver={snapshot.isDraggingOver}
          isDragIndicatorVisible={isDragIndicatorVisible}
        >
          <div
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {children}
            {provided.placeholder}
          </div>
        </StyledDroppableWrapper>
      )}
    </Droppable>
  );
};
