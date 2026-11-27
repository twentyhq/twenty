import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemsWithHiddenSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsWithHiddenSelector';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { getRestoredNavigationMenuItems } from '@/navigation-menu-item/edit/utils/getRestoredNavigationMenuItems';

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

      store.set(navigationMenuItemsDraftState.atom, [
        ...draft,
        ...getRestoredNavigationMenuItems({
          workspaceItems: filterWorkspaceNavigationMenuItems(
            store.get(navigationMenuItemsWithHiddenSelector.atom),
          ),
          draft,
          navigationMenuItemId,
          fallbackParentId,
        }),
      ]);
    },
    [store],
  );

  return { restoreHiddenNavigationMenuItem };
};
