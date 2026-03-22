import { useDraftNavigationMenuItems } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItems';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';

export const useDraftNavigationMenuItemsAllFolders = () => {
  const { currentDraft } = useDraftNavigationMenuItems();

  const allFolders =
    currentDraft?.filter(isNavigationMenuItemFolder).map((item) => ({
      id: item.id,
      name: item.name ?? 'Folder',
      folderId: item.folderId,
      icon: item.icon,
      color: item.color,
    })) ?? [];

  return { allFolders };
};
