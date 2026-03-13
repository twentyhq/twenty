import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FindManyNavigationMenuItemsDocument } from '~/generated-metadata/graphql';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useRemoveNavigationMenuItemByTargetRecordId = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const cache = apolloCoreClient.cache;

  const setPrefetchNavigationMenuItems = useSetAtomState(
    prefetchNavigationMenuItemsState,
  );

  const removeNavigationMenuItemsByTargetRecordIds = useCallback(
    (targetRecordIds: string[]) => {
      const targetRecordIdsSet = new Set(targetRecordIds);
      const currentNavigationMenuItems = store.get(
        prefetchNavigationMenuItemsState.atom,
      );

      const updatedNavigationMenuItems = currentNavigationMenuItems.filter(
        (item) =>
          !isDefined(item.targetRecordId) ||
          !targetRecordIdsSet.has(item.targetRecordId),
      );

      setPrefetchNavigationMenuItems(updatedNavigationMenuItems);

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
    [cache, setPrefetchNavigationMenuItems, store],
  );

  return {
    removeNavigationMenuItemsByTargetRecordIds,
  };
};
