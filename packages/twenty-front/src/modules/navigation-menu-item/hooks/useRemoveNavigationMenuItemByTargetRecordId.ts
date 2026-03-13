import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FindManyNavigationMenuItemsDocument } from '~/generated-metadata/graphql';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useRemoveNavigationMenuItemByTargetRecordId = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const cache = apolloCoreClient.cache;

  const setNavigationMenuItems = useSetAtomState(navigationMenuItemsState);

  const removeNavigationMenuItemsByTargetRecordIds = useCallback(
    (targetRecordIds: string[]) => {
      const targetRecordIdsSet = new Set(targetRecordIds);
      const currentNavigationMenuItems = store.get(
        navigationMenuItemsState.atom,
      );

      const updatedNavigationMenuItems = currentNavigationMenuItems.filter(
        (item) =>
          !isDefined(item.targetRecordId) ||
          !targetRecordIdsSet.has(item.targetRecordId),
      );

      setNavigationMenuItems(updatedNavigationMenuItems);

      cache.updateQuery(
        { query: FindManyNavigationMenuItemsDocument },
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
    [cache, setNavigationMenuItems, store],
  );

  return {
    removeNavigationMenuItemsByTargetRecordIds,
  };
};
