import { useDeleteNavigationMenuItemMutation } from '~/generated-metadata/graphql';

export const useDeleteNavigationMenuItem = () => {
  const [deleteNavigationMenuItemMutation] =
    useDeleteNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

  const deleteNavigationMenuItem = async (id: string) => {
    await deleteNavigationMenuItemMutation({
      variables: { id },
    });
  };

  return { deleteNavigationMenuItem };
};
