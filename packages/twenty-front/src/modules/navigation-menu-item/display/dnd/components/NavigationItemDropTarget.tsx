import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';

const StyledDropTarget = styled.div<{ $compact?: boolean }>`
  min-height: ${({ $compact }) =>
    $compact ? 0 : themeCssVariables.spacing[2]};
  position: relative;
  transition: all 150ms ease-in-out;

  &[data-drag-over='true'] {
    background-color: ${themeCssVariables.background.transparent.blue};

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${themeCssVariables.color.blue};
      border-radius: ${themeCssVariables.border.radius.sm}
        ${themeCssVariables.border.radius.sm} 0 0;
    }
  }

  &[data-drop-forbidden='true'] {
    cursor: not-allowed;
  }
`;

type NavigationItemDropTargetProps = {
  folderId: string | null;
  index: number;
  sectionId: NavigationSections;
  children?: ReactNode;
  compact?: boolean;
  dropTargetIdOverride?: string;
};

export const NavigationItemDropTarget = ({
  folderId,
  index,
  sectionId,
  children,
  compact = false,
  dropTargetIdOverride,
}: NavigationItemDropTargetProps) => {
  const { activeDropTargetId, forbiddenDropTargetId } = useContext(
    NavigationDropTargetContext,
  );
  const dropTargetId =
    dropTargetIdOverride ?? `${sectionId}-${folderId ?? 'orphan'}-${index}`;
  const isDragOver = activeDropTargetId === dropTargetId;
  const isDropForbidden = forbiddenDropTargetId === dropTargetId;

  return (
    <StyledDropTarget
      $compact={compact}
      data-drag-over={isDragOver && !isDropForbidden ? 'true' : undefined}
      data-drop-forbidden={isDropForbidden ? 'true' : undefined}
    >
      {children}
    </StyledDropTarget>
  );
};
