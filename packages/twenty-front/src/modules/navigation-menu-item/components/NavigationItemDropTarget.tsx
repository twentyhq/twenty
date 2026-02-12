import styled from '@emotion/styled';
import { type ReactNode, useContext } from 'react';

import { type NavigationSections } from '@/navigation-menu-item/constants/NavigationSections.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';

const StyledDropTarget = styled.div<{
  $isDragOver: boolean;
  $isDropForbidden: boolean;
  $compact?: boolean;
}>`
  min-height: ${({ theme, $compact }) => ($compact ? 0 : theme.spacing(2))};
  position: relative;
  transition: all 150ms ease-in-out;

  ${({ $isDragOver, theme }) =>
    $isDragOver &&
    `
    background-color: ${theme.background.transparent.blue};

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${theme.color.blue};
      border-radius: ${theme.border.radius.sm} ${theme.border.radius.sm} 0 0;
    }
  `}

  ${({ $isDropForbidden, theme }) =>
    $isDropForbidden &&
    `
    background-color: ${theme.background.transparent.danger};
    cursor: not-allowed;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${theme.color.red};
      border-radius: ${theme.border.radius.sm} ${theme.border.radius.sm} 0 0;
    }
  `}
`;

type NavigationItemDropTargetProps = {
  folderId: string | null;
  index: number;
  sectionId: NavigationSections;
  children?: ReactNode;
  compact?: boolean;
};

export const NavigationItemDropTarget = ({
  folderId,
  index,
  sectionId,
  children,
  compact = false,
}: NavigationItemDropTargetProps) => {
  const { activeDropTargetId, forbiddenDropTargetId } = useContext(
    NavigationDropTargetContext,
  );
  const dropTargetId = `${sectionId}-${folderId ?? 'orphan'}-${index}`;
  const isDragOver = activeDropTargetId === dropTargetId;
  const isDropForbidden = forbiddenDropTargetId === dropTargetId;

  return (
    <StyledDropTarget
      $isDragOver={isDragOver}
      $isDropForbidden={isDropForbidden}
      $compact={compact}
    >
      {children}
    </StyledDropTarget>
  );
};
