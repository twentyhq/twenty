import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

export const useDraftNavigationMenuItemsAllFolders = () => {
  const { currentDraft } = useDraftNavigationMenuItems();

  const allFolders =
    currentDraft?.filter(isNavigationMenuItemFolder).map((item) => ({
      id: item.id,
      name: item.name ?? 'Folder',
      folderId: item.folderId ?? undefined,
    })) ?? [];

  return { allFolders };
};
