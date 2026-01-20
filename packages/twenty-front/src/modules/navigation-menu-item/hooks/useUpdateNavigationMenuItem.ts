import {
  useUpdateNavigationMenuItemMutation,
  type UpdateNavigationMenuItemInput,
} from '~/generated-metadata/graphql';

export const useUpdateNavigationMenuItem = () => {
  const [updateNavigationMenuItemMutation] =
    useUpdateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

  const updateNavigationMenuItem = async (
    input: UpdateNavigationMenuItemInput,
  ) => {
    await updateNavigationMenuItemMutation({
      variables: { input },
    });
  };

  return { updateNavigationMenuItem };
};
