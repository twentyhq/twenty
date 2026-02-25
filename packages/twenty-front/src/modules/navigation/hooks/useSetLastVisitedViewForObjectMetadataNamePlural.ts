import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
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
      const views = store.get(coreViewsState.atom);

      const view = views.find(
        (view: CoreViewWithRelations) => view.id === viewId,
      );

      const objectMetadataItems = store.get(objectMetadataItemsState.atom);

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.namePlural === objectNamePlural,
      );

      if (!isDefined(objectMetadataItem) || !isDefined(view)) {
        return;
      }

      if (view.objectMetadataId !== objectMetadataItem.id) {
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
