import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemsWithHiddenSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsWithHiddenSelector';
import { filterActiveNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterActiveNavigationMenuItems';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';

export const useRestoreHiddenNavigationMenuItem = () => {
  const store = useStore();

  const restoreHiddenNavigationMenuItem = useCallback(
    ({
      navigationMenuItemId,
      fallbackParentId,
    }: {
      navigationMenuItemId: string;
      fallbackParentId: string | null;
    }) => {
      const draft = store.get(navigationMenuItemsDraftState.atom);

      if (!isDefined(draft)) {
        return;
      }

      const workspaceItems = filterWorkspaceNavigationMenuItems(
        store.get(navigationMenuItemsWithHiddenSelector.atom),
      );
      const hiddenItem = workspaceItems.find(
        (item) => item.id === navigationMenuItemId,
      );

      if (!isDefined(hiddenItem)) {
        return;
      }

      const draftIds = new Set(draft.map((item) => item.id));
      const descendantIds = new Set(
        getNavigationMenuItemDescendantIds({
          items: workspaceItems,
          ancestorId: hiddenItem.id,
        }),
      );
      const isParentInDraft =
        !isDefined(hiddenItem.parentId) || draftIds.has(hiddenItem.parentId);
      const restoredItem = {
        ...hiddenItem,
        isActive: true,
        parentId: isParentInDraft ? hiddenItem.parentId : fallbackParentId,
      };

      const restoredItems = filterActiveNavigationMenuItems([
        restoredItem,
        ...workspaceItems.filter((item) => descendantIds.has(item.id)),
      ]).filter((item) => !draftIds.has(item.id));

      store.set(navigationMenuItemsDraftState.atom, [
        ...draft,
        ...restoredItems,
      ]);
    },
    [store],
  );

  return { restoreHiddenNavigationMenuItem };
};
