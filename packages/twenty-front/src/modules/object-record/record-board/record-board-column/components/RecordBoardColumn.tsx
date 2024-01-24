import React from 'react';
import styled from '@emotion/styled';
import { Droppable, DroppableProvided } from '@hello-pangea/dnd';

import { RecordBoardColumnContext } from '@/object-record/record-board/contexts/RecordBoardColumnContext';
import { BoardCardIdContext } from '@/object-record/record-board-deprecated/contexts/BoardCardIdContext';
import { BoardColumnDefinition } from '@/object-record/record-board-deprecated/types/BoardColumnDefinition';

const StyledPlaceholder = styled.div`
  min-height: 1px;
`;

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledColumn = styled.div<{ isFirstColumn: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-left: 1px solid
    ${({ theme, isFirstColumn }) =>
      isFirstColumn ? 'none' : theme.border.color.light};
  display: flex;
  flex-direction: column;
  max-width: 200px;
  min-width: 200px;

  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

type BoardColumnCardsContainerProps = {
  children: React.ReactNode;
  droppableProvided: DroppableProvided;
};

type RecordBoardColumnProps = {
  recordBoardColumnId: string;
  columnDefinition: BoardColumnDefinition;
};

const BoardColumnCardsContainer = ({
  children,
  droppableProvided,
}: BoardColumnCardsContainerProps) => {
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

export const RecordBoardColumn = ({
  recordBoardColumnId,
  columnDefinition,
}: RecordBoardColumnProps) => {
  const isFirstColumn = columnDefinition.position === 0;

  return (
    <RecordBoardColumnContext.Provider
      value={{
        id: recordBoardColumnId,
        columnDefinition: columnDefinition,
      }}
    >
      <Droppable droppableId={recordBoardColumnId}>
        {(droppableProvided) => (
          <StyledColumn isFirstColumn={isFirstColumn}>
            <BoardColumnCardsContainer droppableProvided={droppableProvided}>
              {[].map((cardId, _index) => (
                <BoardCardIdContext.Provider
                  value={cardId}
                  key={cardId}
                ></BoardCardIdContext.Provider>
              ))}
            </BoardColumnCardsContainer>
          </StyledColumn>
        )}
      </Droppable>
    </RecordBoardColumnContext.Provider>
  );
};
