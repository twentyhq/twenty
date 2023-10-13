import { useState } from 'react';
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
  const [v4Persistable] = useState(v4());

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
