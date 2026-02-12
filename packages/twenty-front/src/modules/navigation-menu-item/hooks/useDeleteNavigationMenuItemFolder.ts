import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';

export const useDeleteNavigationMenuItemFolder = () => {
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  const deleteNavigationMenuItemFolder = async (
    folderId: string,
  ): Promise<void> => {
    await deleteNavigationMenuItem(folderId);
  };

  return {
    deleteNavigationMenuItemFolder,
  };
};
