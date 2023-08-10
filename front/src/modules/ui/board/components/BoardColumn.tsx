import React from 'react';
import styled from '@emotion/styled';

import { Tag } from '@/ui/tag/components/Tag';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { BoardColumnHotkeyScope } from '../types/BoardColumnHotkeyScope';

import { BoardColumnMenu } from './BoardColumnMenu';

export const StyledColumn = styled.div<{ isFirstColumn: boolean }>`
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

export const StyledColumnTitle = styled.h3<{
  colorHexCode?: string;
  colorName?: string;
}>`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ colorHexCode, colorName, theme }) =>
    colorName ? theme.tag.text[colorName] : colorHexCode};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
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

type OwnProps = {
  color: string;
  title: string;
  onTitleEdit: (title: string, color: string) => void;
  totalAmount?: number;
  children: React.ReactNode;
  isFirstColumn: boolean;
  numChildren: number;
};

export function BoardColumn({
  color,
  title,
  onTitleEdit,
  totalAmount,
  children,
  isFirstColumn,
  numChildren,
}: OwnProps) {
  const [isBoardColumnMenuOpen, setIsBoardColumnMenuOpen] =
    React.useState(false);

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  function handleTitleClick() {
    setIsBoardColumnMenuOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(BoardColumnHotkeyScope.BoardColumn, {
      goto: false,
    });
  }

  function handleClose() {
    goBackToPreviousHotkeyScope();
    setIsBoardColumnMenuOpen(false);
  }

  return (
    <StyledColumn isFirstColumn={isFirstColumn}>
      <StyledHeader>
        <Tag onClick={handleTitleClick} color={color} text={title} />
        {!!totalAmount && <StyledAmount>${totalAmount}</StyledAmount>}
        <StyledNumChildren>{numChildren}</StyledNumChildren>
      </StyledHeader>
      {isBoardColumnMenuOpen && (
        <BoardColumnMenu
          onClose={handleClose}
          onTitleEdit={onTitleEdit}
          title={title}
          color={color}
        />
      )}
      {children}
    </StyledColumn>
  );
}
