import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useLazyPrefetchedData } from '@/prefetch/hooks/useLazyPrefetchData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useSetLastVisitedViewForObjectMetadataNamePlural = () => {
  const { records: views, findManyRecords } = useLazyPrefetchedData<View>(
    PrefetchKey.AllViews,
  );

  const setLastVisitedViewForObjectMetadataNamePlural = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
        objectNamePlural,
        viewId,
      }: {
        objectNamePlural: string;
        viewId: string;
      }) => {
        await findManyRecords();

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
    [findManyRecords, views],
  );

  return {
    setLastVisitedViewForObjectMetadataNamePlural,
  };
};
