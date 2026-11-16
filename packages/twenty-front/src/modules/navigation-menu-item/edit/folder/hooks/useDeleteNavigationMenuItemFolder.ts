import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';

export const useDeleteNavigationMenuItemFolder = () => {
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const deleteNavigationMenuItemFolder = async (
    folderId: string,
  ): Promise<void> => {
    await deleteManyNavigationMenuItems([folderId]);
  };

  return {
    deleteNavigationMenuItemFolder,
  };
};
