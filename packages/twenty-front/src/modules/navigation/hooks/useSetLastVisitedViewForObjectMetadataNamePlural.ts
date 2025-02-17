import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useSetLastVisitedViewForObjectMetadataNamePlural = () => {
  const setLastVisitedViewForObjectMetadataNamePlural = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        objectNamePlural,
        viewId,
      }: {
        objectNamePlural: string;
        viewId: string;
      }) => {
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
