import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Draggable, Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { IconDotsVertical } from '@/ui/display/icon';
import { Tag } from '@/ui/display/tag/components/Tag';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { RecordBoardCard } from '@/ui/object/record-board/components/RecordBoardCard';
import { BoardCardIdContext } from '@/ui/object/record-board/contexts/BoardCardIdContext';
import { BoardColumnDefinition } from '@/ui/object/record-board/types/BoardColumnDefinition';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { BoardColumnContext } from '../contexts/BoardColumnContext';
import { recordBoardCardIdsByColumnIdFamilyState } from '../states/recordBoardCardIdsByColumnIdFamilyState';
import { recordBoardColumnTotalsFamilySelector } from '../states/selectors/recordBoardColumnTotalsFamilySelector';
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

const StyledHeaderActions = styled.div`
  display: flex;
  margin-left: auto;
`;

type BoardColumnCardsContainerProps = {
  children: React.ReactNode;
  droppableProvided: DroppableProvided;
};

type RecordBoardColumnProps = {
  recordBoardColumnId: string;
  columnDefinition: BoardColumnDefinition;
  recordBoardOptions: BoardOptions;
  recordBoardColumnTotal: number;
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
  recordBoardColumnId,
  columnDefinition,
  recordBoardOptions,
  recordBoardColumnTotal,
  onDelete,
  onTitleEdit,
}: RecordBoardColumnProps) => {
  const [isBoardColumnMenuOpen, setIsBoardColumnMenuOpen] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleBoardColumnMenuOpen = () => {
    setIsBoardColumnMenuOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(BoardColumnHotkeyScope.BoardColumn, {
      goto: false,
    });
  };

  const handleBoardColumnMenuClose = () => {
    goBackToPreviousHotkeyScope();
    setIsBoardColumnMenuOpen(false);
  };

  const boardColumnTotal = useRecoilValue(
    recordBoardColumnTotalsFamilySelector(recordBoardColumnId),
  );

  const cardIds = useRecoilValue(
    recordBoardCardIdsByColumnIdFamilyState(recordBoardColumnId),
  );

  const handleTitleEdit = (title: string, color: string) => {
    onTitleEdit(recordBoardColumnId, title, color);
  };

  const isFirstColumn = columnDefinition.position === 0;

  return (
    <BoardColumnContext.Provider
      value={{
        id: recordBoardColumnId,
        columnDefinition: columnDefinition,
        isFirstColumn: columnDefinition.position === 0,
        isLastColumn: columnDefinition.position === recordBoardColumnTotal - 1,
      }}
    >
      <Droppable droppableId={recordBoardColumnId}>
        {(droppableProvided) => (
          <StyledColumn isFirstColumn={isFirstColumn}>
            <StyledHeader
              onMouseEnter={() => setIsHeaderHovered(true)}
              onMouseLeave={() => setIsHeaderHovered(false)}
            >
              <Tag
                onClick={handleBoardColumnMenuOpen}
                color={columnDefinition.colorCode ?? 'gray'}
                text={columnDefinition.title}
              />
              {!!boardColumnTotal && (
                <StyledAmount>${boardColumnTotal}</StyledAmount>
              )}
              {!isHeaderHovered && (
                <StyledNumChildren>{cardIds.length}</StyledNumChildren>
              )}
              {isHeaderHovered && (
                <StyledHeaderActions>
                  <LightIconButton
                    accent="tertiary"
                    Icon={IconDotsVertical}
                    onClick={handleBoardColumnMenuOpen}
                  />
                  {/* <LightIconButton
                  accent="tertiary"
                  Icon={IconPlus}
                  onClick={() => {}}
                /> */}
                </StyledHeaderActions>
              )}
            </StyledHeader>
            {isBoardColumnMenuOpen && (
              <RecordBoardColumnDropdownMenu
                onClose={handleBoardColumnMenuClose}
                onDelete={onDelete}
                onTitleEdit={handleTitleEdit}
                stageId={recordBoardColumnId}
              />
            )}

            {isBoardColumnMenuOpen && (
              <RecordBoardColumnDropdownMenu
                onClose={handleBoardColumnMenuClose}
                onDelete={onDelete}
                onTitleEdit={handleTitleEdit}
                stageId={recordBoardColumnId}
              />
            )}
            <BoardColumnCardsContainer droppableProvided={droppableProvided}>
              {cardIds.map((cardId, index) => (
                <BoardCardIdContext.Provider value={cardId} key={cardId}>
                  <RecordBoardCard
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
