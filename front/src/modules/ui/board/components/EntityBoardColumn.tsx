import { type Context, useContext } from 'react';
import styled from '@emotion/styled';
import { Draggable, Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { BoardColumn } from '@/ui/board/components/BoardColumn';
import { BoardCardIdContext } from '@/ui/board/contexts/BoardCardIdContext';
import { BoardColumnIdContext } from '@/ui/board/contexts/BoardColumnIdContext';
import { BoardColumnDefinition } from '@/ui/board/types/BoardColumnDefinition';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { boardCardIdsByColumnIdFamilyState } from '../states/boardCardIdsByColumnIdFamilyState';
import { boardColumnTotalsFamilySelector } from '../states/selectors/boardColumnTotalsFamilySelector';
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

export const EntityBoardColumn = ({
  boardOptions,
  column,
  onDelete,
  onTitleEdit,
  scopeContext,
}: {
  boardOptions: BoardOptions;
  column: BoardColumnDefinition;
  onDelete?: (columnId: string) => void;
  onTitleEdit: (columnId: string, title: string, color: string) => void;
  scopeContext: Context<string | null>;
}) => {
  const boardColumnId = useContext(BoardColumnIdContext) ?? '';

  const boardColumnTotal = useRecoilValue(
    boardColumnTotalsFamilySelector(column.id),
  );

  const cardIds = useRecoilValue(
    boardCardIdsByColumnIdFamilyState(boardColumnId ?? ''),
  );

  const handleTitleEdit = (title: string, color: string) => {
    onTitleEdit(boardColumnId, title, color);
  };

  return (
    <Droppable droppableId={column.id}>
      {(droppableProvided) => (
        <BoardColumn
          onTitleEdit={handleTitleEdit}
          onDelete={onDelete}
          title={column.title}
          color={column.colorCode}
          totalAmount={boardColumnTotal}
          isFirstColumn={column.index === 0}
          numChildren={cardIds.length}
          stageId={column.id}
        >
          <BoardColumnCardsContainer droppableProvided={droppableProvided}>
            {cardIds.map((cardId, index) => (
              <BoardCardIdContext.Provider value={cardId} key={cardId}>
                <EntityBoardCard
                  index={index}
                  cardId={cardId}
                  boardOptions={boardOptions}
                  scopeContext={scopeContext}
                />
              </BoardCardIdContext.Provider>
            ))}
            <Draggable
              draggableId={`new-${column.id}`}
              index={cardIds.length}
              isDragDisabled={true}
            >
              {(draggableProvided) => (
                <div
                  ref={draggableProvided?.innerRef}
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
};
