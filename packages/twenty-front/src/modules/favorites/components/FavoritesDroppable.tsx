import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';

type FavoritesDroppableProps = {
  droppableId: string;
  children: React.ReactNode;
  isDragIndicatorVisible?: boolean;
  showDropLine?: boolean;
};

const StyledDroppableWrapper = styled.div<{
  isDraggingOver: boolean;
  isDragIndicatorVisible: boolean;
  showDropLine: boolean;
}>`
  position: relative;
  transition: all 150ms ease-in-out;
  width: 100%;

  ${({ isDraggingOver, isDragIndicatorVisible, showDropLine, theme }) =>
    isDraggingOver &&
    isDragIndicatorVisible &&
    `
        background-color: ${theme.background.transparent.blue};
        
        ${
          showDropLine &&
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
        `
        }
      `}
`;

export const FavoritesDroppable = ({
  droppableId,
  children,
  isDragIndicatorVisible = true,
  showDropLine = true,
}: FavoritesDroppableProps) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <StyledDroppableWrapper
          isDraggingOver={snapshot.isDraggingOver}
          isDragIndicatorVisible={isDragIndicatorVisible}
          showDropLine={showDropLine}
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
