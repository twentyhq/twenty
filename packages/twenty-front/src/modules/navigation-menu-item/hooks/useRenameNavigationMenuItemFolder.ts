import { useUpdateNavigationMenuItem } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItem';

export const useRenameNavigationMenuItemFolder = () => {
  const { updateNavigationMenuItem } = useUpdateNavigationMenuItem();

  const renameNavigationMenuItemFolder = async (
    folderId: string,
    newName: string,
  ): Promise<void> => {
    if (!newName) {
      return;
    }

    await updateNavigationMenuItem({
      id: folderId,
      name: newName,
    });
  };

  return {
    renameNavigationMenuItemFolder,
  };
};
