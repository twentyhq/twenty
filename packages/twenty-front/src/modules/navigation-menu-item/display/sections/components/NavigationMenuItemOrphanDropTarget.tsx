import type { ReactNode } from 'react';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
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
  droppableId = NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS,
  highlightPosition = 'bottom',
}: NavigationMenuItemOrphanDropTargetProps) => (
  <NavigationItemDropTarget
    folderId={null}
    index={index}
    sectionId={sectionId}
    compact={compact}
    dropTargetIdOverride={getDndKitDropTargetId(droppableId, index)}
    highlightPosition={highlightPosition}
  >
    {children}
  </NavigationItemDropTarget>
);
