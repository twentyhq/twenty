import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { Draggable, Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { Tag } from '@/ui/display/tag/components/Tag';
import { RecordBoardCard } from '@/ui/object/record-board/components/RecordBoardCard';
import { BoardCardIdContext } from '@/ui/object/record-board/contexts/BoardCardIdContext';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { BoardColumnContext } from '../contexts/BoardColumnContext';
import { boardCardIdsByColumnIdFamilyState } from '../states/boardCardIdsByColumnIdFamilyState';
import { boardColumnTotalsFamilySelector } from '../states/selectors/boardColumnTotalsFamilySelector';
import { BoardColumnHotkeyScope } from '../types/BoardColumnHotkeyScope';
import { BoardOptions } from '../types/BoardOptions';

import { RecordBoardColumnDropdownMenu } from './RecordBoardColumnDropdownMenu';

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

const StyledHeader = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 24px;
  justify-content: left;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledAmount = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledNumChildren = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 20px;
  justify-content: center;
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  margin-left: auto;
  width: 16px;
`;

type BoardColumnCardsContainerProps = {
  children: React.ReactNode;
  droppableProvided: DroppableProvided;
};

type RecordBoardColumnProps = {
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

export const RecordBoardColumn = ({
  boardOptions,
  onDelete,
  onTitleEdit,
}: RecordBoardColumnProps) => {
  const column = useContext(BoardColumnContext);

  const [isBoardColumnMenuOpen, setIsBoardColumnMenuOpen] =
    React.useState(false);

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleTitleClick = () => {
    setIsBoardColumnMenuOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(BoardColumnHotkeyScope.BoardColumn, {
      goto: false,
    });
  };

  const handleClose = () => {
    goBackToPreviousHotkeyScope();
    setIsBoardColumnMenuOpen(false);
  };

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

  const { isFirstColumn, columnDefinition } = column;

  return (
    <Droppable droppableId={column.id}>
      {(droppableProvided) => (
        <StyledColumn isFirstColumn={isFirstColumn}>
          <StyledHeader>
            <Tag
              onClick={handleTitleClick}
              color={columnDefinition.colorCode ?? 'gray'}
              text={columnDefinition.title}
            />
            {!!boardColumnTotal && (
              <StyledAmount>${boardColumnTotal}</StyledAmount>
            )}
            <StyledNumChildren>{cardIds.length}</StyledNumChildren>
          </StyledHeader>
          {isBoardColumnMenuOpen && (
            <RecordBoardColumnDropdownMenu
              onClose={handleClose}
              onDelete={onDelete}
              onTitleEdit={handleTitleEdit}
              stageId={boardColumnId}
            />
          )}
          <BoardColumnCardsContainer droppableProvided={droppableProvided}>
            {cardIds.map((cardId, index) => (
              <BoardCardIdContext.Provider value={cardId} key={cardId}>
                <RecordBoardCard
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
        </StyledColumn>
      )}
    </Droppable>
  );
};
