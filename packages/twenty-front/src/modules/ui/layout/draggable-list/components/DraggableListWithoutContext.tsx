import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { v4 } from 'uuid';

type DraggableListWithoutContextProps = {
  draggableItems: React.ReactNode;
  droppableId?: string;
};

const StyledDragDropItemsWrapper = styled.div`
  width: 100%;
`;

export const DraggableListWithoutContext = ({
  draggableItems,
  droppableId: providedDroppableId,
}: DraggableListWithoutContextProps) => {
  const [v4Persistable] = useState(v4());
  const effectiveDroppableId = providedDroppableId ?? v4Persistable;

  return (
    <StyledDragDropItemsWrapper>
      <Droppable droppableId={effectiveDroppableId}>
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
  );
};
