import { type UpdateNavigationMenuItemInput } from '~/generated-metadata/graphql';

import { useUpdateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems';

export const useUpdateNavigationMenuItem = () => {
  const { updateManyNavigationMenuItems } = useUpdateManyNavigationMenuItems();

  const updateNavigationMenuItem = async (
    input: UpdateNavigationMenuItemInput & { id: string },
  ) => {
    const { id, ...update } = input;

    await updateManyNavigationMenuItems([{ id, update }]);
  };

  return { updateNavigationMenuItem };
};
