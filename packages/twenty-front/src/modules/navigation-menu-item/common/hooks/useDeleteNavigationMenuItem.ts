import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';

export const useDeleteNavigationMenuItem = () => {
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const deleteNavigationMenuItem = async (id: string) => {
    await deleteManyNavigationMenuItems([id]);
  };

  return { deleteNavigationMenuItem };
};
