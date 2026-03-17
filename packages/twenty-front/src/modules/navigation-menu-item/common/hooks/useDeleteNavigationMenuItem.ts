import { useMutation } from '@apollo/client/react';
import { DELETE_NAVIGATION_MENU_ITEM } from '@/navigation-menu-item/common/graphql/mutations/deleteNavigationMenuItem';

export const useDeleteNavigationMenuItem = () => {
  const [deleteNavigationMenuItemMutation] = useMutation(
    DELETE_NAVIGATION_MENU_ITEM,
    {
      refetchQueries: ['FindManyNavigationMenuItems'],
    },
  );

  const deleteNavigationMenuItem = async (id: string) => {
    await deleteNavigationMenuItemMutation({
      variables: { id },
    });
  };

  return { deleteNavigationMenuItem };
};
