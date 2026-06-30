import { useCallback } from 'react';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useOptimisticRemoveNavigationMenuItemsByViewId = () => {
  const store = useStore();
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

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
    },
    [store, replaceDraft, applyChanges],
  );

  return {
    removeNavigationMenuItemsByViewIds,
  };
};
