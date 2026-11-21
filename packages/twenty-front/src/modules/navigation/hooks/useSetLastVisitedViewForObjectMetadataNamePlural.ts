import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { viewSummariesSelector } from '@/views/states/selectors/viewSummariesSelector';
import { ViewKey } from '@/views/types/ViewKey';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useSetLastVisitedViewForObjectMetadataNamePlural = () => {
  const store = useStore();
  const setLastVisitedViewForObjectMetadataNamePlural = useCallback(
    async ({
      objectNamePlural,
      viewId,
    }: {
      objectNamePlural: string;
      viewId: string;
    }) => {
      const views = store.get(viewSummariesSelector.atom);

      const view = views.find((view) => view.id === viewId);

      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.namePlural === objectNamePlural,
      );

      if (!isDefined(objectMetadataItem) || !isDefined(view)) {
        return;
      }

      if (view.objectMetadataId !== objectMetadataItem.id) {
        return;
      }

      if (view.key === ViewKey.INDEX) {
        return;
      }

      const lastVisitedViewPerObjectMetadataItem = store.get(
        lastVisitedViewPerObjectMetadataItemState.atom,
      );

      const lastVisitedViewId =
        lastVisitedViewPerObjectMetadataItem?.[objectMetadataItem?.id];

      if (isDefined(objectMetadataItem) && lastVisitedViewId !== viewId) {
        store.set(lastVisitedViewPerObjectMetadataItemState.atom, {
          ...lastVisitedViewPerObjectMetadataItem,
          [objectMetadataItem.id]: viewId,
        });
      }
    },
    [store],
  );

  return {
    setLastVisitedViewForObjectMetadataNamePlural,
  };
};
