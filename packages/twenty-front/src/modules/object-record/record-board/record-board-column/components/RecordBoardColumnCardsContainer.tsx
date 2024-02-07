import React from 'react';
import styled from '@emotion/styled';
import { DroppableProvided } from '@hello-pangea/dnd';

import { RecordBoardColumnCardsMemo } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsMemo';

const StyledPlaceholder = styled.div`
  min-height: 1px;
`;

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

type RecordBoardColumnCardsContainerProps = {
  recordIds: string[];
  droppableProvided: DroppableProvided;
};

export const RecordBoardColumnCardsContainer = ({
  recordIds,
  droppableProvided,
}: RecordBoardColumnCardsContainerProps) => {
  return (
    <StyledColumnCardsContainer
      ref={droppableProvided?.innerRef}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...droppableProvided?.droppableProps}
    >
      <RecordBoardColumnCardsMemo recordIds={recordIds} />
      <StyledPlaceholder>{droppableProvided?.placeholder}</StyledPlaceholder>
    </StyledColumnCardsContainer>
  );
};
