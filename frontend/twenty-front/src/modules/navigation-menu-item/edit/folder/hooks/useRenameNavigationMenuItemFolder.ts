import { useUpdateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems';

export const useRenameNavigationMenuItemFolder = () => {
  const { updateManyNavigationMenuItems } = useUpdateManyNavigationMenuItems();

  const renameNavigationMenuItemFolder = async (
    folderId: string,
    newName: string,
  ): Promise<void> => {
    if (!newName) {
      return;
    }

    await updateManyNavigationMenuItems([
      { id: folderId, update: { name: newName } },
    ]);
  };

  return {
    renameNavigationMenuItemFolder,
  };
};
