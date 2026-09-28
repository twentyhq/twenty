import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { NavigationMenuItemInsertionPreview } from '@/navigation-menu-item/edit/components/NavigationMenuItemInsertionPreview';
import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { type NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';

const StyledDropTarget = styled.div<{
  $compact?: boolean;
  $highlightPosition?: 'top' | 'bottom';
}>`
  min-height: ${({ $compact }) =>
    $compact ? 0 : themeCssVariables.spacing[2]};
  position: relative;
  transition: all 150ms ease-in-out;

  &[data-drag-over='true'] {
    background-color: ${themeCssVariables.background.transparent.blue};

    &::before {
      content: '';
      position: absolute;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${themeCssVariables.color.blue};
      ${({ $highlightPosition }) =>
        $highlightPosition === 'top'
          ? `
      top: 0;
      border-radius: 0 0 ${themeCssVariables.border.radius.sm}
        ${themeCssVariables.border.radius.sm};
      `
          : `
      bottom: 0;
      border-radius: ${themeCssVariables.border.radius.sm}
        ${themeCssVariables.border.radius.sm} 0 0;
      `}
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
  highlightPosition?: 'top' | 'bottom';
  previewSubItemState?: NavigationDrawerSubItemState;
};

export const NavigationItemDropTarget = ({
  folderId,
  index,
  sectionId,
  children,
  compact = false,
  dropTargetIdOverride,
  highlightPosition = 'bottom',
  previewSubItemState,
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
      $highlightPosition={highlightPosition}
      data-drag-over={isDragOver && !isDropForbidden ? 'true' : undefined}
      data-drop-forbidden={isDropForbidden ? 'true' : undefined}
    >
      <NavigationMenuItemInsertionPreview
        folderId={folderId}
        index={index}
        sectionId={sectionId}
        subItemState={previewSubItemState}
      />
      {children}
    </StyledDropTarget>
  );
};
