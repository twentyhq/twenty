import { useMutation } from '@apollo/client/react';
import {
  type NavigationMenuItem,
  UpdateManyNavigationMenuItemsDocument,
  type UpdateOneNavigationMenuItemInput,
} from '~/generated-metadata/graphql';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { useStore } from 'jotai';

export const useUpdateManyNavigationMenuItems = () => {
  const { updateInDraft, addToDraft, replaceDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const [updateManyNavigationMenuItemsMutation] = useMutation(
    UpdateManyNavigationMenuItemsDocument,
  );

  const store = useStore();

  const updateManyNavigationMenuItems = async (
    inputs: UpdateOneNavigationMenuItemInput[],
  ): Promise<NavigationMenuItem[]> => {
    if (inputs.length === 0) {
      return [];
    }

    const previousItems = store.get(navigationMenuItemsSelector.atom);

    const optimisticItems = inputs.map(
      ({ id, update }) => ({ id, ...update }) as NavigationMenuItem,
    );

    updateInDraft('navigationMenuItems', optimisticItems);
    applyChanges();

    try {
      const result = await updateManyNavigationMenuItemsMutation({
        variables: { inputs },
      });

      const updatedItems = result.data?.updateManyNavigationMenuItems ?? [];

      if (updatedItems.length > 0) {
        addToDraft({ key: 'navigationMenuItems', items: updatedItems });
        applyChanges();
      }

      return updatedItems;
    } catch (error) {
      replaceDraft('navigationMenuItems', previousItems);
      applyChanges();
      throw error;
    }
  };

  return { updateManyNavigationMenuItems };
};
