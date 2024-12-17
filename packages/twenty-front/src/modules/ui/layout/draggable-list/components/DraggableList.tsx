import styled from '@emotion/styled';
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
  OnDragStartResponder,
} from '@hello-pangea/dnd';
import { useState } from 'react';
import { v4 } from 'uuid';
type DraggableListProps = {
  draggableItems: React.ReactNode;
  onDragEnd: OnDragEndResponder;
  onDragStart?: OnDragStartResponder;
};

const StyledDragDropItemsWrapper = styled.div`
  width: 100%;
`;

export const DraggableList = ({
  draggableItems,
  onDragEnd,
  onDragStart,
}: DraggableListProps) => {
  const [v4Persistable] = useState(v4());

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <StyledDragDropItemsWrapper>
        <Droppable droppableId={v4Persistable}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...provided.droppableProps}
            >
              {draggableItems}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </StyledDragDropItemsWrapper>
    </DragDropContext>
  );
};
