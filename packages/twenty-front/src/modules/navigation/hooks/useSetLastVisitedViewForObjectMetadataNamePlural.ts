import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSetLastVisitedViewForObjectMetadataNamePlural = () => {
  const setLastVisitedViewForObjectMetadataNamePlural = useCallback(
    async ({
      objectNamePlural,
      viewId,
    }: {
      objectNamePlural: string;
      viewId: string;
    }) => {
      const views = jotaiStore.get(coreViewsState.atom);

      const view = views.find(
        (view: CoreViewWithRelations) => view.id === viewId,
      );

      const objectMetadataItems = jotaiStore.get(objectMetadataItemsState.atom);

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.namePlural === objectNamePlural,
      );

      if (!isDefined(objectMetadataItem) || !isDefined(view)) {
        return;
      }

      if (view.objectMetadataId !== objectMetadataItem.id) {
        return;
      }

      const lastVisitedViewPerObjectMetadataItem = jotaiStore.get(
        lastVisitedViewPerObjectMetadataItemState.atom,
      );

      const lastVisitedViewId =
        lastVisitedViewPerObjectMetadataItem?.[objectMetadataItem?.id];

      if (isDefined(objectMetadataItem) && lastVisitedViewId !== viewId) {
        jotaiStore.set(lastVisitedViewPerObjectMetadataItemState.atom, {
          ...lastVisitedViewPerObjectMetadataItem,
          [objectMetadataItem.id]: viewId,
        });
      }
    },
    [],
  );

  return {
    setLastVisitedViewForObjectMetadataNamePlural,
  };
};
