import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { recordBoardColumnTotalsFamilySelector } from '@/object-record/record-board-deprecated/states/selectors/recordBoardDeprecatedColumnTotalsFamilySelector';
import { BoardColumnDefinition } from '@/object-record/record-board-deprecated/types/BoardColumnDefinition';
import { IconDotsVertical } from '@/ui/display/icon';
import { Tag } from '@/ui/display/tag/components/Tag';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { recordBoardCardIdsByColumnIdFamilyState } from '../states/recordBoardCardIdsByColumnIdFamilyState';
import { BoardColumnHotkeyScope } from '../types/BoardColumnHotkeyScope';

import { RecordBoardDeprecatedColumnDropdownMenu } from './RecordBoardDeprecatedColumnDropdownMenu';

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

type RecordBoardDeprecatedColumnHeaderProps = {
  recordBoardColumnId: string;
  columnDefinition: BoardColumnDefinition;
  onDelete?: (columnId: string) => void;
};

export const RecordBoardDeprecatedColumnHeader = ({
  recordBoardColumnId,
  columnDefinition,
  onDelete,
}: RecordBoardDeprecatedColumnHeaderProps) => {
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

  return (
    <>
      <StyledHeader
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <Tag
          onClick={handleBoardColumnMenuOpen}
          color={columnDefinition.colorCode ?? 'gray'}
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
            {/* <LightIconButton
                  accent="tertiary"
                  Icon={IconPlus}
                  onClick={() => {}}
                /> */}
          </StyledHeaderActions>
        )}
      </StyledHeader>
      {isBoardColumnMenuOpen && (
        <RecordBoardDeprecatedColumnDropdownMenu
          onClose={handleBoardColumnMenuClose}
          onDelete={onDelete}
          stageId={recordBoardColumnId}
        />
      )}
    </>
  );
};
