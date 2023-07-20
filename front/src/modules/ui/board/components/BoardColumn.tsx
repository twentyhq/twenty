import React from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';

import { useScopedHotkeys } from '../../hotkey/hooks/useScopedHotkeys';
import { Tag } from '../../tag/components/Tag';
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

type OwnProps = {
  color?: string;
  title: string;
  pipelineStageId?: string;
  onTitleEdit: (title: string) => void;
  onColumnColorEdit: (color: string) => void;
  totalAmount?: number;
  children: React.ReactNode;
  isFirstColumn: boolean;
};

export function BoardColumn({
  color,
  title,
  onTitleEdit,
  onColumnColorEdit,
  totalAmount,
  children,
  isFirstColumn,
}: OwnProps) {
  const [isBoardColumnMenuOpen, setIsBoardColumnMenuOpen] =
    React.useState(false);

  const setHotkeyScope = useSetHotkeyScope();
  setHotkeyScope(BoardColumnHotkeyScope.BoardColumn, { goto: false });
  useScopedHotkeys(
    [Key.Escape, Key.Enter],
    () => setIsBoardColumnMenuOpen(false),
    BoardColumnHotkeyScope.BoardColumn,
    [],
  );

  return (
    <StyledColumn isFirstColumn={isFirstColumn}>
      <StyledHeader>
        <Tag
          onClick={() => setIsBoardColumnMenuOpen(true)}
          color={color}
          text={title}
        />
        {!!totalAmount && <StyledAmount>${totalAmount}</StyledAmount>}
      </StyledHeader>
      {isBoardColumnMenuOpen && (
        <BoardColumnMenu
          onClose={() => setIsBoardColumnMenuOpen(false)}
          onTitleEdit={onTitleEdit}
          onColumnColorEdit={onColumnColorEdit}
          title={title}
          color={color}
        />
      )}
      {children}
    </StyledColumn>
  );
}
