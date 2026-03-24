import { useMutation } from '@apollo/client/react';
import { DeleteManyNavigationMenuItemsDocument } from '~/generated-metadata/graphql';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { useStore } from 'jotai';

export const useDeleteManyNavigationMenuItems = () => {
  const { removeFromDraft, replaceDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const [deleteManyNavigationMenuItemsMutation] = useMutation(
    DeleteManyNavigationMenuItemsDocument,
  );

  const store = useStore();

  const deleteManyNavigationMenuItems = async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    const previousItems = store.get(navigationMenuItemsSelector.atom);

    removeFromDraft({ key: 'navigationMenuItems', itemIds: ids });
    applyChanges();

    try {
      await deleteManyNavigationMenuItemsMutation({ variables: { ids } });
    } catch (error) {
      replaceDraft('navigationMenuItems', previousItems);
      applyChanges();
      throw error;
    }
  };

  return { deleteManyNavigationMenuItems };
};
