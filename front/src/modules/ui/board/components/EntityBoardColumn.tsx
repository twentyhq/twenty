import { useContext } from 'react';
import styled from '@emotion/styled';
import { Draggable, Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { BoardColumn } from '@/ui/board/components/BoardColumn';
import { BoardCardIdContext } from '@/ui/board/states/BoardCardIdContext';
import { BoardColumnIdContext } from '@/ui/board/states/BoardColumnIdContext';
import { BoardColumnDefinition } from '@/ui/board/types/BoardColumnDefinition';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { boardCardIdsByColumnIdFamilyState } from '../states/boardCardIdsByColumnIdFamilyState';
import { boardColumnTotalsFamilySelector } from '../states/boardColumnTotalsFamilySelector';
import { BoardOptions } from '../types/BoardOptions';

import { EntityBoardCard } from './EntityBoardCard';

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

const BoardColumnCardsContainer = ({
  children,
  droppableProvided,
}: {
  children: React.ReactNode;
  droppableProvided: DroppableProvided;
}) => {
  return (
    <StyledColumnCardsContainer
      ref={droppableProvided?.innerRef}
      {...droppableProvided?.droppableProps}
    >
      {children}
      <StyledPlaceholder>{droppableProvided?.placeholder}</StyledPlaceholder>
    </StyledColumnCardsContainer>
  );
};

export function EntityBoardColumn({
  column,
  boardOptions,
  onEditColumnTitle,
}: {
  column: BoardColumnDefinition;
  boardOptions: BoardOptions;
  onEditColumnTitle: (columnId: string, title: string, color: string) => void;
}) {
  const boardColumnId = useContext(BoardColumnIdContext) ?? '';

  const boardColumnTotal = useRecoilValue(
    boardColumnTotalsFamilySelector(column.id),
  );

  const cardIds = useRecoilValue(
    boardCardIdsByColumnIdFamilyState(boardColumnId ?? ''),
  );

  function handleEditColumnTitle(title: string, color: string) {
    onEditColumnTitle(boardColumnId, title, color);
  }

  return (
    <Droppable droppableId={column.id}>
      {(droppableProvided) => (
        <BoardColumn
          onTitleEdit={handleEditColumnTitle}
          title={column.title}
          color={column.colorCode}
          totalAmount={boardColumnTotal}
          isFirstColumn={column.index === 0}
          numChildren={cardIds.length}
        >
          <BoardColumnCardsContainer droppableProvided={droppableProvided}>
            {cardIds.map((cardId, index) => (
              <BoardCardIdContext.Provider value={cardId} key={cardId}>
                <EntityBoardCard
                  index={index}
                  cardId={cardId}
                  boardOptions={boardOptions}
                />
              </BoardCardIdContext.Provider>
            ))}
            <Draggable draggableId={`new-${column.id}`} index={cardIds.length}>
              {(draggableProvided) => (
                <div
                  ref={draggableProvided?.innerRef}
                  {...{
                    ...draggableProvided.dragHandleProps,
                    draggable: false,
                  }}
                  {...draggableProvided?.draggableProps}
                >
                  <StyledNewCardButtonContainer>
                    <RecoilScope>{boardOptions.newCardComponent}</RecoilScope>
                  </StyledNewCardButtonContainer>
                </div>
              )}
            </Draggable>
          </BoardColumnCardsContainer>
        </BoardColumn>
      )}
    </Droppable>
  );
}
