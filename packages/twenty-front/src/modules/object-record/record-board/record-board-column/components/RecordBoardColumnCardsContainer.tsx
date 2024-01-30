import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { Draggable, DroppableProvided } from '@hello-pangea/dnd';

import { RecordBoardColumnCardsMemo } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsMemo';
import { RecordBoardColumnNewButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewButton';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';

const StyledPlaceholder = styled.div`
  min-height: 1px;
`;

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledNewButtonContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;

type RecordBoardColumnCardsContainerProps = {
  recordIds: string[];
  droppableProvided: DroppableProvided;
};

export const RecordBoardColumnCardsContainer = ({
  recordIds,
  droppableProvided,
}: RecordBoardColumnCardsContainerProps) => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);

  return (
    <StyledColumnCardsContainer
      ref={droppableProvided?.innerRef}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...droppableProvided?.droppableProps}
    >
      <RecordBoardColumnCardsMemo recordIds={recordIds} />
      <StyledPlaceholder>{droppableProvided?.placeholder}</StyledPlaceholder>
      <Draggable
        draggableId={`new-${columnDefinition.id}`}
        index={recordIds.length}
        isDragDisabled={true}
      >
        {(draggableProvided) => (
          <div
            ref={draggableProvided?.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.draggableProps}
          >
            <StyledNewButtonContainer>
              <RecordBoardColumnNewButton />
            </StyledNewButtonContainer>
          </div>
        )}
      </Draggable>
    </StyledColumnCardsContainer>
  );
};
