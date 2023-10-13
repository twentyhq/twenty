import { useContext } from 'react';
import styled from '@emotion/styled';
import { Draggable, Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { BoardColumn } from '@/ui/board/components/BoardColumn';
import { BoardCardIdContext } from '@/ui/board/contexts/BoardCardIdContext';
import { BoardColumnContext } from '@/ui/board/contexts/BoardColumnContext';
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

type BoardColumnCardsContainerProps = {
  children: React.ReactNode;
  droppableProvided: DroppableProvided;
};

type EntityBoardColumnProps = {
  boardOptions: BoardOptions;
  onDelete?: (columnId: string) => void;
  onTitleEdit: (columnId: string, title: string, color: string) => void;
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

export const EntityBoardColumn = ({
  boardOptions,
  onDelete,
  onTitleEdit,
}: EntityBoardColumnProps) => {
  const column = useContext(BoardColumnContext);

  const boardColumnId = column?.id || '';

  const boardColumnTotal = useRecoilValue(
    boardColumnTotalsFamilySelector(boardColumnId),
  );

  const cardIds = useRecoilValue(
    boardCardIdsByColumnIdFamilyState(boardColumnId),
  );

  const handleTitleEdit = (title: string, color: string) => {
    onTitleEdit(boardColumnId, title, color);
  };

  if (!column) return <></>;

  return (
    <Droppable droppableId={column.id}>
      {(droppableProvided) => (
        <BoardColumn
          onTitleEdit={handleTitleEdit}
          onDelete={onDelete}
          totalAmount={boardColumnTotal}
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
                  // eslint-disable-next-line react/jsx-props-no-spreading
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
