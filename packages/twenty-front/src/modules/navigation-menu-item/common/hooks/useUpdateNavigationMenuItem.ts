import { useMutation } from '@apollo/client/react';
import {
  type UpdateNavigationMenuItemInput,
  type UpdateOneNavigationMenuItemInput,
} from '~/generated-metadata/graphql';
import { UPDATE_NAVIGATION_MENU_ITEM } from '@/navigation-menu-item/common/graphql/mutations/updateNavigationMenuItem';

export const useUpdateNavigationMenuItem = () => {
  const [updateNavigationMenuItemMutation] = useMutation(
    UPDATE_NAVIGATION_MENU_ITEM,
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
