import { useCallback } from 'react';

import { FIND_MANY_NAVIGATION_MENU_ITEMS } from '@/navigation-menu-item/graphql/queries/findManyNavigationMenuItems';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveNavigationMenuItemByTargetRecordId = () => {
  const apolloCoreClient = useApolloCoreClient();
  const cache = apolloCoreClient.cache;

  const setNavigationMenuItemsState = useSetRecoilStateV2(
    prefetchNavigationMenuItemsState,
  );

  const removeNavigationMenuItemsByTargetRecordIds = useCallback(
    (targetRecordIds: string[]) => {
      const targetRecordIdsSet = new Set(targetRecordIds);
      const currentNavigationMenuItems = jotaiStore.get(
        prefetchNavigationMenuItemsState.atom,
      );

      const updatedNavigationMenuItems = currentNavigationMenuItems.filter(
        (item) =>
          !isDefined(item.targetRecordId) ||
          !targetRecordIdsSet.has(item.targetRecordId),
      );

      setNavigationMenuItemsState(updatedNavigationMenuItems);

      cache.updateQuery({ query: FIND_MANY_NAVIGATION_MENU_ITEMS }, (data) => {
        if (!isDefined(data?.navigationMenuItems)) {
          return data;
        }

        return {
          ...data,
          navigationMenuItems: updatedNavigationMenuItems,
        };
      });
    },
    [cache, setNavigationMenuItemsState],
  );

  return {
    removeNavigationMenuItemsByTargetRecordIds,
  };
};
