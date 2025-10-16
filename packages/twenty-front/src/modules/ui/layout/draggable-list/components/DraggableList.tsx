import styled from '@emotion/styled';
import {
  DragDropContext,
  Droppable,
  type OnDragEndResponder,
  type OnDragStartResponder,
} from '@hello-pangea/dnd';
import { useState } from 'react';

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
  const [v4Persistable] = useState(crypto.randomUUID());

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
