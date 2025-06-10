import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { View } from '@/views/types/View';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSetLastVisitedViewForObjectMetadataNamePlural = () => {
  const setLastVisitedViewForObjectMetadataNamePlural = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
        objectNamePlural,
        viewId,
      }: {
        objectNamePlural: string;
        viewId: string;
      }) => {
        const views = snapshot.getLoadable(prefetchViewsState).getValue();

        const view = views.find((view: View) => view.id === viewId);

        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.namePlural === objectNamePlural,
        );

        if (!isDefined(objectMetadataItem) || !isDefined(view)) {
          return;
        }

        if (view.objectMetadataId !== objectMetadataItem.id) {
          return;
        }

        const lastVisitedViewPerObjectMetadataItem = snapshot
          .getLoadable(lastVisitedViewPerObjectMetadataItemState)
          .getValue();

        const lastVisitedViewId =
          lastVisitedViewPerObjectMetadataItem?.[objectMetadataItem?.id];

        if (isDefined(objectMetadataItem) && lastVisitedViewId !== viewId) {
          set(lastVisitedViewPerObjectMetadataItemState, {
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
