import { useMutation } from '@apollo/client/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { DeleteManyNavigationMenuItemsDocument } from '~/generated-metadata/graphql';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { navigationMenuItemsWithHiddenSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsWithHiddenSelector';
import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';
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

      const hiddenItems = (
        result.data?.deleteManyNavigationMenuItems ?? []
      ).filter((item) => item.isActive === false);

      if (isNonEmptyArray(hiddenItems)) {
        const hiddenDescendantIds = new Set(
          hiddenItems.flatMap(({ id }) =>
            getNavigationMenuItemDescendantIds({
              items: previousItems,
              ancestorId: id,
            }),
          ),
        );

        addToDraft({
          key: 'navigationMenuItems',
          items: [
            ...previousItems.filter(({ id }) => hiddenDescendantIds.has(id)),
            ...hiddenItems,
          ],
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
