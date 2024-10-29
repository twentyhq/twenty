import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';
import { useState } from 'react';
import { v4 } from 'uuid';
type DraggableListProps = {
  draggableItems: React.ReactNode;
  onDragEnd: OnDragEndResponder;
};

const StyledDragDropItemsWrapper = styled.div`
  width: 100%;
`;

const StyledFavouritesDragItemsWrapper = styled.div<{
  isMobile?: boolean;
}>`
  display: ${({ isMobile }) => (isMobile ? 'flex' : 'block')};
  gap: ${({ theme, isMobile }) => (isMobile ? theme.spacing(3) : 0)};
`;

export const DraggableList = ({
  draggableItems,
  onDragEnd,
}: DraggableListProps) => {
  const [v4Persistable] = useState(v4());
  const isMobile = useIsMobile();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <StyledDragDropItemsWrapper>
        <Droppable droppableId={v4Persistable}>
          {(provided) => (
            <StyledFavouritesDragItemsWrapper
              isMobile={isMobile}
              ref={provided.innerRef}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...provided.droppableProps}
            >
              {draggableItems}
              {provided.placeholder}
            </StyledFavouritesDragItemsWrapper>
          )}
        </Droppable>
      </StyledDragDropItemsWrapper>
    </DragDropContext>
  );
};
