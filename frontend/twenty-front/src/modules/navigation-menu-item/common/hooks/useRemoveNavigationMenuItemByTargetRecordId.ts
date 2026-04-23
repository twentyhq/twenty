import { useCallback } from 'react';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  FindManyNavigationMenuItemsDocument,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useRemoveNavigationMenuItemByTargetRecordId = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const cache = apolloCoreClient.cache;
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

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
    removeNavigationMenuItemsByTargetRecordIds,
  };
};
