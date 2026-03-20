import { useCallback } from 'react';

import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  FindManyNavigationMenuItemsDocument,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useRemoveNavigationMenuItemByViewId = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const cache = apolloCoreClient.cache;
  const { replaceDraft, applyChanges } = useMetadataStore();

  const removeNavigationMenuItemsByViewIds = useCallback(
    (viewIds: string[]) => {
      const viewIdsSet = new Set(viewIds);
      const entry = store.get(
        metadataStoreState.atomFamily('navigationMenuItems'),
      );
      const currentNavigationMenuItems =
        entry.current as unknown as NavigationMenuItem[];

      const updatedNavigationMenuItems = currentNavigationMenuItems.filter(
        (item) => !isDefined(item.viewId) || !viewIdsSet.has(item.viewId),
      );

      replaceDraft('navigationMenuItems', updatedNavigationMenuItems);
      applyChanges();

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
    [cache, store, replaceDraft, applyChanges],
  );

  return {
    removeNavigationMenuItemsByViewIds,
  };
};
