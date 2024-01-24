import React from 'react';
import styled from '@emotion/styled';
import { DroppableProvided } from '@hello-pangea/dnd';

const StyledPlaceholder = styled.div`
  min-height: 1px;
`;

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

type RecordBoardColumnCardsContainerProps = {
  children: React.ReactNode;
  droppableProvided: DroppableProvided;
};

export const RecordBoardColumnCardsContainer = ({
  children,
  droppableProvided,
}: RecordBoardColumnCardsContainerProps) => {
  return (
    <StyledColumnCardsContainer
      ref={droppableProvided?.innerRef}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...droppableProvided?.droppableProps}
    >
      {children}
      <StyledPlaceholder>{droppableProvided?.placeholder}</StyledPlaceholder>
    </StyledColumnCardsContainer>
  );
};
