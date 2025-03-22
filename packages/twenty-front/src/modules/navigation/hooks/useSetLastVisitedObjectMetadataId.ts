import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSetLastVisitedObjectMetadataId = () => {
  const setLastVisitedObjectMetadataId = useRecoilCallback(
    ({ set, snapshot }) =>
      ({ objectMetadataItemId }: { objectMetadataItemId: string }) => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === objectMetadataItemId,
        );

        const lastVisitedObjectMetadataItemId = snapshot
          .getLoadable(lastVisitedObjectMetadataItemIdState)
          .getValue();

        if (
          isDefined(objectMetadataItem) &&
          lastVisitedObjectMetadataItemId !== objectMetadataItemId
        ) {
          set(lastVisitedObjectMetadataItemIdState, objectMetadataItemId);
        }
      },
    [],
  );

  return {
    setLastVisitedObjectMetadataId,
  };
};
