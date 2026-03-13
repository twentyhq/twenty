import { useMutation } from '@apollo/client/react';
import {
  type UpdateNavigationMenuItemInput,
  type UpdateOneNavigationMenuItemInput,
  UpdateNavigationMenuItemDocument,
} from '~/generated-metadata/graphql';

export const useUpdateNavigationMenuItem = () => {
  const [updateNavigationMenuItemMutation] = useMutation(
    UpdateNavigationMenuItemDocument,
    {
      refetchQueries: ['FindManyNavigationMenuItems'],
    },
  );

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
