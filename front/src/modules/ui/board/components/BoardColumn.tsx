import React, { useContext } from 'react';
import styled from '@emotion/styled';

import { Tag } from '@/ui/tag/components/Tag';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { BoardColumnContext } from '../contexts/BoardColumnContext';
import { BoardColumnHotkeyScope } from '../types/BoardColumnHotkeyScope';

import { BoardColumnMenu } from './BoardColumnMenu';

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

export type BoardColumnProps = {
  onDelete?: (id: string) => void;
  onTitleEdit: (title: string, color: string) => void;
  totalAmount?: number;
  children: React.ReactNode;
  numChildren: number;
  stageId: string;
};

export const BoardColumn = ({
  onDelete,
  onTitleEdit,
  totalAmount,
  children,
  numChildren,
  stageId,
}: BoardColumnProps) => {
  const boardColumn = useContext(BoardColumnContext);

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

  if (!boardColumn) return <></>;

  const { isFirstColumn, columnDefinition } = boardColumn;

  return (
    <StyledColumn isFirstColumn={isFirstColumn}>
      <StyledHeader>
        <Tag
          onClick={handleTitleClick}
          color={columnDefinition.colorCode ?? 'gray'}
          text={columnDefinition.title}
        />
        {!!totalAmount && <StyledAmount>${totalAmount}</StyledAmount>}
        <StyledNumChildren>{numChildren}</StyledNumChildren>
      </StyledHeader>
      {isBoardColumnMenuOpen && (
        <BoardColumnMenu
          onClose={handleClose}
          onDelete={onDelete}
          onTitleEdit={onTitleEdit}
          stageId={stageId}
        />
      )}
      {children}
    </StyledColumn>
  );
};
