import styled from '@emotion/styled';
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';
import { v4 } from 'uuid';

type DraggableListProps = {
  draggableItems: React.ReactNode;
  onDragEnd: OnDragEndResponder;
};

const StyledDragDropItemsWrapper = styled.div`
  width: 100%;
`;

export const DraggableList = ({
  draggableItems,
  onDragEnd,
}: DraggableListProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <StyledDragDropItemsWrapper>
        <Droppable droppableId={v4()}>
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
