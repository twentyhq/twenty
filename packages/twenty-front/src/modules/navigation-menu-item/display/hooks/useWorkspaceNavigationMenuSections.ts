import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSection';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useWorkspaceNavigationMenuSections = (
  parentId: string | null,
): NavigationMenuItem[] => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  return workspaceNavigationMenuItems
    .filter(
      (item) =>
        isNavigationMenuItemSection(item) &&
        (item.folderId ?? null) === parentId,
    )
    .sort((a, b) => a.position - b.position);
};
