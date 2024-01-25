import React, { useContext, useState } from 'react';
import styled from '@emotion/styled';

import { RecordBoardColumnContext } from '@/object-record/record-board/contexts/RecordBoardColumnContext';
import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { BoardColumnHotkeyScope } from '@/object-record/record-board-deprecated/types/BoardColumnHotkeyScope';
import { IconDotsVertical } from '@/ui/display/icon';
import { Tag } from '@/ui/display/tag/components/Tag';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

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

export const RecordBoardColumnHeader = () => {
  const [isBoardColumnMenuOpen, setIsBoardColumnMenuOpen] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const { columnDefinition } = useContext(RecordBoardColumnContext);

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

  const boardColumnTotal = 0;
  const cardIds = [];

  return (
    <>
      <StyledHeader
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <Tag
          onClick={handleBoardColumnMenuOpen}
          color={columnDefinition.color}
          text={columnDefinition.title}
        />
        {!!boardColumnTotal && <StyledAmount>${boardColumnTotal}</StyledAmount>}
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
          </StyledHeaderActions>
        )}
      </StyledHeader>
      {isBoardColumnMenuOpen && (
        <RecordBoardColumnDropdownMenu
          onClose={handleBoardColumnMenuClose}
          stageId={columnDefinition.id}
        />
      )}
    </>
  );
};
