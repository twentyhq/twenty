import styled from '@emotion/styled';
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';

type DroppableListProps = {
  droppableId: string;
  draggableItems: React.ReactNode;
  onDragEnd: OnDragEndResponder;
};

const StyledDragDropItemsWrapper = styled.div`
  width: 100%;
`;

export const DroppableList = ({
  droppableId,
  draggableItems,
  onDragEnd,
}: DroppableListProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <StyledDragDropItemsWrapper>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {draggableItems}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </StyledDragDropItemsWrapper>
    </DragDropContext>
  );
};
