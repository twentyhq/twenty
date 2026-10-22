import { type ReactNode, useContext } from 'react';

import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections';
import { NavigationMenuItemContainerContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemContainerContext';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { getNavigationMenuItemContainerDroppableId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemContainerDroppableId';
import { NavigationItemDropTarget } from '@/navigation-menu-item/display/dnd/components/NavigationItemDropTarget';

type NavigationMenuItemOrphanDropTargetProps = {
  index: number;
  compact?: boolean;
  children?: ReactNode;
  sectionId?: NavigationSections;
  droppableId?: string;
  highlightPosition?: 'top' | 'bottom';
};

export const NavigationMenuItemOrphanDropTarget = ({
  index,
  compact = false,
  children,
  sectionId = NavigationSections.WORKSPACE,
  droppableId,
  highlightPosition = 'bottom',
}: NavigationMenuItemOrphanDropTargetProps) => {
  const { containerId } = useContext(NavigationMenuItemContainerContext);
  const isWorkspaceContainer = sectionId === NavigationSections.WORKSPACE;

  return (
    <NavigationItemDropTarget
      folderId={isWorkspaceContainer ? containerId : null}
      index={index}
      sectionId={sectionId}
      compact={compact}
      dropTargetIdOverride={getDndKitDropTargetId(
        droppableId ?? getNavigationMenuItemContainerDroppableId(containerId),
        index,
      )}
      highlightPosition={highlightPosition}
    >
      {children}
    </NavigationItemDropTarget>
  );
};
