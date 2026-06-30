import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';

export const useNavigationMenuItemSectionAllFolders = () => {
  const { currentItems } = useNavigationMenuItemEditController();

  const allFolders = currentItems
    .filter(isNavigationMenuItemFolder)
    .map((item) => ({
      id: item.id,
      name: item.name ?? 'Folder',
      folderId: item.folderId,
      icon: item.icon,
      color: item.color,
    }));

  return { allFolders };
};
