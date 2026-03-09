import type { ReactNode } from 'react';

import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import { NavigationSections } from '@/navigation-menu-item/constants/NavigationSections.constants';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { getDndKitDropTargetId } from '@/navigation-menu-item/utils/getDndKitDropTargetId';

type WorkspaceOrphanDropTargetProps = {
  index: number;
  compact?: boolean;
  children?: ReactNode;
};

export const WorkspaceOrphanDropTarget = ({
  index,
  compact = false,
  children,
}: WorkspaceOrphanDropTargetProps) => (
  <NavigationItemDropTarget
    folderId={null}
    index={index}
    sectionId={NavigationSections.WORKSPACE}
    compact={compact}
    dropTargetIdOverride={getDndKitDropTargetId(
      NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS,
      index,
    )}
  >
    {children}
  </NavigationItemDropTarget>
);
