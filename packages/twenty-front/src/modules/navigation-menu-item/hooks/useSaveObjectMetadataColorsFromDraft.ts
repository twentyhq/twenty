import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { ViewKey } from '@/views/types/ViewKey';

export const useSaveObjectMetadataColorsFromDraft = () => {
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const store = useStore();

  const saveObjectMetadataColors = useCallback(async () => {
    const draft = store.get(navigationMenuItemsDraftState.atom);
    const currentItems = store.get(navigationMenuItemsState.atom);
    const views = store.get(viewsSelector.atom);

    if (!draft) return;

    const workspaceItems = filterWorkspaceNavigationMenuItems(currentItems);
    const workspaceItemsById = new Map(workspaceItems.map((i) => [i.id, i]));

    for (const draftItem of draft) {
      const original = workspaceItemsById.get(draftItem.id);

      if (!original) continue;
      if (!isDefined(draftItem.viewId)) continue;
      if ((original.color ?? null) === (draftItem.color ?? null)) continue;

      const view = views.find((v) => v.id === draftItem.viewId);

      if (!isDefined(view) || view.key !== ViewKey.INDEX) continue;

      await updateOneObjectMetadataItem({
        idToUpdate: view.objectMetadataId,
        updatePayload: { color: draftItem.color ?? null },
      });
    }
  }, [store, updateOneObjectMetadataItem]);

  return { saveObjectMetadataColors };
};
