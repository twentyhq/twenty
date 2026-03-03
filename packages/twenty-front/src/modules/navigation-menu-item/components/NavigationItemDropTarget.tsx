import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type NavigationSections } from '@/navigation-menu-item/constants/NavigationSections.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';

const StyledDropTarget = styled.div<{
  $isDragOver: boolean;
  $isDropForbidden: boolean;
  $compact?: boolean;
}>`
  min-height: ${({ $compact }) =>
    $compact ? 0 : themeCssVariables.spacing[2]};
  position: relative;
  transition: all 150ms ease-in-out;

  ${({ $isDragOver }) =>
    $isDragOver
      ? `
    background-color: ${themeCssVariables.background.transparent.blue};

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${themeCssVariables.color.blue};
      border-radius: ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0 0;
    }
  `
      : ''}

  ${({ $isDropForbidden }) =>
    $isDropForbidden
      ? `
    background-color: ${themeCssVariables.background.transparent.danger};
    cursor: not-allowed;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${themeCssVariables.color.red};
      border-radius: ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0 0;
    }
  `
      : ''}
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
