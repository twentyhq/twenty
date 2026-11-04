import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { NavigationMenuItemInsertionPreview } from '@/navigation-menu-item/edit/components/NavigationMenuItemInsertionPreview';
import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { type NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDropLine } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemDropLine';

const StyledDropTarget = styled.div<{
  $compact?: boolean;
}>`
  min-height: ${({ $compact }) =>
    $compact ? 0 : themeCssVariables.spacing[2]};
  position: relative;
  transition: all 150ms ease-in-out;

  &[data-drag-over='true'] {
    background-color: ${themeCssVariables.background.transparent.blue};
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
  const isDropAllowed = isDragOver && !isDropForbidden;

  return (
    <StyledDropTarget
      $compact={compact}
      data-drag-over={isDropAllowed ? 'true' : undefined}
      data-drop-forbidden={isDropForbidden ? 'true' : undefined}
    >
      {isDropAllowed && (
        <NavigationMenuItemDropLine position={highlightPosition} />
      )}
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
