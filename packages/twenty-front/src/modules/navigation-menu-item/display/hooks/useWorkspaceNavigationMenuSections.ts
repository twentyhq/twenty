import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getNavigationMenuItemSectionsInContainer } from '@/navigation-menu-item/common/utils/getNavigationMenuItemSectionsInContainer';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useWorkspaceNavigationMenuSections = (
  parentId: string | null,
): NavigationMenuItem[] => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  return getNavigationMenuItemSectionsInContainer({
    items: workspaceNavigationMenuItems,
    containerId: parentId,
  });
};
