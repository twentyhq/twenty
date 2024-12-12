import { FavoritesDropIndicatorContext } from '@/favorites/contexts/FavoritesDropIndicatorContext';
import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import React, { useContext, useState } from 'react';
import { v4 } from 'uuid';

type DraggableListWithoutContextProps = {
  draggableItems: React.ReactNode;
  droppableId?: string;
};

const StyledDragDropItemsWrapper = styled.div`
  width: 100%;
`;

const StyledDroppableContainer = styled.div`
  position: relative;
`;

const StyledIndicator = styled.div`
  position: absolute;
  height: 2px;
  width: 100%;
  background-color: ${({ theme }) => theme.color.blue};
  transition: all 0.2s ease;
`;

export const DraggableListWithoutContext = ({
  draggableItems,
  droppableId: providedDroppableId,
}: DraggableListWithoutContextProps) => {
  const [v4Persistable] = useState(v4());
  const effectiveDroppableId = providedDroppableId ?? v4Persistable;
  const { droppableId, index, isDragging } = useContext(
    FavoritesDropIndicatorContext,
  );

  return (
    <StyledDragDropItemsWrapper>
      <Droppable droppableId={effectiveDroppableId}>
        {(provided) => (
          <StyledDroppableContainer
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {draggableItems}
            {isDragging && droppableId === effectiveDroppableId && (
              <StyledIndicator
                style={{
                  top: `${index ? index * 32 : 0}px`,
                }}
              />
            )}
            {provided.placeholder}
          </StyledDroppableContainer>
        )}
      </Droppable>
    </StyledDragDropItemsWrapper>
  );
};
