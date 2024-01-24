import React from 'react';
import styled from '@emotion/styled';
import { Draggable, Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { RecordBoardDeprecatedCard } from '@/object-record/record-board-deprecated/components/RecordBoardDeprecatedCard';
import { RecordBoardDeprecatedColumnHeader } from '@/object-record/record-board-deprecated/components/RecordBoardDeprecatedColumnHeader';
import { BoardCardIdContext } from '@/object-record/record-board-deprecated/contexts/BoardCardIdContext';
import { BoardColumnDefinition } from '@/object-record/record-board-deprecated/types/BoardColumnDefinition';

import { BoardColumnContext } from '../contexts/BoardColumnContext';
import { recordBoardCardIdsByColumnIdFamilyState } from '../states/recordBoardCardIdsByColumnIdFamilyState';
import { BoardOptions } from '../types/BoardOptions';

const StyledPlaceholder = styled.div`
  min-height: 1px;
`;

const StyledNewCardButtonContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(4)};
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

type RecordBoardDeprecatedColumnProps = {
  recordBoardColumnId: string;
  columnDefinition: BoardColumnDefinition;
  recordBoardOptions: BoardOptions;
  recordBoardColumnTotal: number;
  onDelete?: (columnId: string) => void;
  onTitleEdit: (params: {
    columnId: string;
    title: string;
    color: string;
  }) => void;
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

export const RecordBoardDeprecatedColumn = ({
  recordBoardColumnId,
  columnDefinition,
  recordBoardOptions,
  recordBoardColumnTotal,
  onDelete,
  onTitleEdit,
}: RecordBoardDeprecatedColumnProps) => {
  const cardIds = useRecoilValue(
    recordBoardCardIdsByColumnIdFamilyState(recordBoardColumnId),
  );

  const isFirstColumn = columnDefinition.position === 0;

  return (
    <BoardColumnContext.Provider
      value={{
        id: recordBoardColumnId,
        columnDefinition: columnDefinition,
        isFirstColumn: columnDefinition.position === 0,
        isLastColumn: columnDefinition.position === recordBoardColumnTotal - 1,
        onTitleEdit: ({ title, color }) =>
          onTitleEdit({ columnId: recordBoardColumnId, title, color }),
      }}
    >
      <Droppable droppableId={recordBoardColumnId}>
        {(droppableProvided) => (
          <StyledColumn isFirstColumn={isFirstColumn}>
            <RecordBoardDeprecatedColumnHeader
              recordBoardColumnId={recordBoardColumnId}
              columnDefinition={columnDefinition}
              onDelete={onDelete}
            />
            <BoardColumnCardsContainer droppableProvided={droppableProvided}>
              {cardIds.map((cardId, index) => (
                <BoardCardIdContext.Provider value={cardId} key={cardId}>
                  <RecordBoardDeprecatedCard
                    index={index}
                    cardId={cardId}
                    recordBoardOptions={recordBoardOptions}
                  />
                </BoardCardIdContext.Provider>
              ))}
              <Draggable
                draggableId={`new-${recordBoardColumnId}`}
                index={cardIds.length}
                isDragDisabled={true}
              >
                {(draggableProvided) => (
                  <div
                    ref={draggableProvided?.innerRef}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...draggableProvided?.draggableProps}
                  >
                    <StyledNewCardButtonContainer>
                      {recordBoardOptions.newCardComponent}
                    </StyledNewCardButtonContainer>
                  </div>
                )}
              </Draggable>
            </BoardColumnCardsContainer>
          </StyledColumn>
        )}
      </Droppable>
    </BoardColumnContext.Provider>
  );
};
