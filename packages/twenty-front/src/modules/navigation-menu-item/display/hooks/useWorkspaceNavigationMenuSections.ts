import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useWorkspaceNavigationMenuSections = (
  parentId: string | null,
): NavigationMenuItem[] => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  return workspaceNavigationMenuItems
    .filter(
      (item) =>
        isNavigationMenuItemAnySection(item) &&
        (item.folderId ?? null) === parentId,
    )
    .sort((a, b) => a.position - b.position);
};
