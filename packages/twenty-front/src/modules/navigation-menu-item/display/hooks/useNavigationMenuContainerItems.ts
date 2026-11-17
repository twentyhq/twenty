import { isDefined } from 'twenty-shared/utils';

import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useReadableNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useReadableNavigationMenuItems';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const useNavigationMenuContainerItems = (containerId: string) => {
  const items = useNavigationMenuItemSectionItems(containerId);

  const folderChildrenById = new Map<string, NavigationMenuItem[]>();
  for (const item of items) {
    if (isDefined(item.parentId) && item.parentId !== containerId) {
      folderChildrenById.set(item.parentId, [
        ...(folderChildrenById.get(item.parentId) ?? []),
        item,
      ]);
    }
  }

  const { filteredTopLevelItems, filteredFolderChildrenById } =
    useReadableNavigationMenuItems({
      topLevelItems: items.filter((item) => item.parentId === containerId),
      folderChildrenById,
    });

  return {
    topLevelItems: filteredTopLevelItems,
    folderChildrenById: filteredFolderChildrenById,
  };
};
