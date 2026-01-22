import {
  useUpdateNavigationMenuItemMutation,
  type UpdateNavigationMenuItemInput,
  type UpdateOneNavigationMenuItemInput,
} from '~/generated-metadata/graphql';

export const useUpdateNavigationMenuItem = () => {
  const [updateNavigationMenuItemMutation] =
    useUpdateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

  const updateNavigationMenuItem = async (
    input: UpdateNavigationMenuItemInput & { id: string },
  ) => {
    const { id, ...update } = input;
    const updateOneInput: UpdateOneNavigationMenuItemInput = {
      id,
      update,
    };

    await updateNavigationMenuItemMutation({
      variables: { input: updateOneInput },
    });
  };

  return { updateNavigationMenuItem };
};
