import { useMutation } from '@apollo/client/react';
import { DeleteNavigationMenuItemDocument } from '~/generated-metadata/graphql';

export const useDeleteNavigationMenuItem = () => {
  const [deleteNavigationMenuItemMutation] =
    useMutation(DeleteNavigationMenuItemDocument, {
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

  const deleteNavigationMenuItem = async (id: string) => {
    await deleteNavigationMenuItemMutation({
      variables: { id },
    });
  };

  return { deleteNavigationMenuItem };
};
