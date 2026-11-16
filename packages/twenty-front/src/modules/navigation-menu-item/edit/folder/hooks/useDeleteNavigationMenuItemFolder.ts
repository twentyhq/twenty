import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';

export const useDeleteNavigationMenuItemFolder = () => {
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const deleteNavigationMenuItemFolder = async (
    parentId: string,
  ): Promise<void> => {
    await deleteManyNavigationMenuItems([parentId]);
  };

  return {
    deleteNavigationMenuItemFolder,
  };
};
