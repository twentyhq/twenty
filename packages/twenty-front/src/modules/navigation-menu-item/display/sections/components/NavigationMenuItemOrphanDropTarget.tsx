import type { ReactNode } from 'react';

import { NavigationItemDropTarget } from '@/navigation-menu-item/display/dnd/components/NavigationItemDropTarget';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';

type NavigationMenuItemOrphanDropTargetProps = {
  index: number;
  compact?: boolean;
  children?: ReactNode;
};

export const NavigationMenuItemOrphanDropTarget = ({
  index,
  compact = false,
  children,
}: NavigationMenuItemOrphanDropTargetProps) => (
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
