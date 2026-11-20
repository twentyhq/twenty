import { useMutation } from '@apollo/client/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { DeleteManyNavigationMenuItemsDocument } from '~/generated-metadata/graphql';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { navigationMenuItemsWithHiddenSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsWithHiddenSelector';
import { getNavigationMenuItemsKeptAfterRemoval } from '@/navigation-menu-item/common/utils/getNavigationMenuItemsKeptAfterRemoval';
import { useStore } from 'jotai';

export const useDeleteManyNavigationMenuItems = () => {
  const { addToDraft, removeFromDraft, replaceDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const [deleteManyNavigationMenuItemsMutation] = useMutation(
    DeleteManyNavigationMenuItemsDocument,
  );

  const store = useStore();

  const deleteManyNavigationMenuItems = async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    const previousItems = store.get(navigationMenuItemsWithHiddenSelector.atom);

    removeFromDraft({ key: 'navigationMenuItems', itemIds: ids });
    applyChanges();

    try {
      const result = await deleteManyNavigationMenuItemsMutation({
        variables: { ids },
      });

      const keptNavigationMenuItems = getNavigationMenuItemsKeptAfterRemoval({
        navigationMenuItemsBeforeRemoval: previousItems,
        removedNavigationMenuItems:
          result.data?.deleteManyNavigationMenuItems ?? [],
      });

      if (isNonEmptyArray(keptNavigationMenuItems)) {
        addToDraft({
          key: 'navigationMenuItems',
          items: keptNavigationMenuItems,
        });
        applyChanges();
      }
    } catch (error) {
      replaceDraft('navigationMenuItems', previousItems);
      applyChanges();
      throw error;
    }
  };

  return { deleteManyNavigationMenuItems };
};
