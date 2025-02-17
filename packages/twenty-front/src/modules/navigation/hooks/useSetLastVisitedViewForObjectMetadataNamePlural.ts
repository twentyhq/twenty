import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useLazyPrefetchedData } from '@/prefetch/hooks/useLazyPrefetchData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useSetLastVisitedViewForObjectMetadataNamePlural = () => {
  const { findManyRecords } = useLazyPrefetchedData(PrefetchKey.AllViews);

  const setLastVisitedViewForObjectMetadataNamePlural = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
        objectNamePlural,
        viewId,
      }: {
        objectNamePlural: string;
        viewId: string;
      }) => {
        console.log('setLastVisitedViewForObjectMetadataNamePlural');
        const views = await findManyRecords();

        console.log(views);

        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.namePlural === objectNamePlural,
        );

        const lastVisitedViewPerObjectMetadataItem = snapshot
          .getLoadable(lastVisitedObjectMetadataItemIdState)
          .getValue();

        const lastVisitedViewId =
          lastVisitedViewPerObjectMetadataItem?.[objectMetadataItem?.id];

        if (isDefined(objectMetadataItem) && lastVisitedViewId !== viewId) {
          set(lastVisitedViewPerObjectMetadataItemState, {
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
