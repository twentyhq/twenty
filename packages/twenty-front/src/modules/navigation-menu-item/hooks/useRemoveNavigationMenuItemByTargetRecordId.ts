import { useRecoilCallback } from 'recoil';

import { FIND_MANY_NAVIGATION_MENU_ITEMS } from '@/navigation-menu-item/graphql/queries/findManyNavigationMenuItems';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveNavigationMenuItemByTargetRecordId = () => {
  const apolloCoreClient = useApolloCoreClient();
  const cache = apolloCoreClient.cache;

  const removeNavigationMenuItemsByTargetRecordIds = useRecoilCallback(
    ({ set, snapshot }) =>
      (targetRecordIds: string[]) => {
        const targetRecordIdsSet = new Set(targetRecordIds);
        const currentNavigationMenuItems = snapshot
          .getLoadable(prefetchNavigationMenuItemsState)
          .getValue();

        const updatedNavigationMenuItems = currentNavigationMenuItems.filter(
          (item) =>
            !isDefined(item.targetRecordId) ||
            !targetRecordIdsSet.has(item.targetRecordId),
        );

        set(prefetchNavigationMenuItemsState, updatedNavigationMenuItems);

        cache.updateQuery(
          { query: FIND_MANY_NAVIGATION_MENU_ITEMS },
          (data) => {
            if (!isDefined(data?.navigationMenuItems)) {
              return data;
            }

            return {
              ...data,
              navigationMenuItems: updatedNavigationMenuItems,
            };
          },
        );
      },
    [cache],
  );

  return {
    removeNavigationMenuItemsByTargetRecordIds,
  };
};
