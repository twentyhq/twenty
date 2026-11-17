import { groupNavigationMenuItemsByContainer } from '@/navigation-menu-item/common/utils/groupNavigationMenuItemsByContainer';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useReadableNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useReadableNavigationMenuItems';

export const useNavigationMenuContainerItems = (containerId: string) => {
  const items = useNavigationMenuItemSectionItems(containerId);

  const { filteredTopLevelItems, filteredFolderChildrenById } =
    useReadableNavigationMenuItems(
      groupNavigationMenuItemsByContainer({ items, containerId }),
    );

  return {
    topLevelItems: filteredTopLevelItems,
    folderChildrenById: filteredFolderChildrenById,
  };
};
