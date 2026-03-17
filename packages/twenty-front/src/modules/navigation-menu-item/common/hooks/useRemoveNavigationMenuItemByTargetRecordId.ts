import { useCallback } from 'react';

import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { FIND_MANY_NAVIGATION_MENU_ITEMS } from '@/navigation-menu-item/common/graphql/queries/findManyNavigationMenuItems';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useRemoveNavigationMenuItemByTargetRecordId = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const cache = apolloCoreClient.cache;
  const { updateDraft, applyChanges } = useMetadataStore();

  const removeNavigationMenuItemsByTargetRecordIds = useCallback(
    (targetRecordIds: string[]) => {
      const targetRecordIdsSet = new Set(targetRecordIds);
      const entry = store.get(
        metadataStoreState.atomFamily('navigationMenuItems'),
      );
      const currentNavigationMenuItems =
        entry.current as unknown as NavigationMenuItem[];

      const updatedNavigationMenuItems = currentNavigationMenuItems.filter(
        (item) =>
          !isDefined(item.targetRecordId) ||
          !targetRecordIdsSet.has(item.targetRecordId),
      );

      updateDraft('navigationMenuItems', updatedNavigationMenuItems);
      applyChanges();

      cache.updateQuery<{ navigationMenuItems: NavigationMenuItem[] }>(
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
    [cache, store, updateDraft, applyChanges],
  );

  return {
    removeNavigationMenuItemsByTargetRecordIds,
  };
};
