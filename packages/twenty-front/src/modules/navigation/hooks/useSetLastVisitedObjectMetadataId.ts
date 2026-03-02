import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useSetLastVisitedObjectMetadataId = () => {
  const store = useStore();
  const setLastVisitedObjectMetadataId = useCallback(
    ({ objectMetadataItemId }: { objectMetadataItemId: string }) => {
      const objectMetadataItems = store.get(objectMetadataItemsState.atom);

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === objectMetadataItemId,
      );

      const lastVisitedObjectMetadataItemId = store.get(
        lastVisitedObjectMetadataItemIdState.atom,
      );

      if (
        isDefined(objectMetadataItem) &&
        lastVisitedObjectMetadataItemId !== objectMetadataItemId
      ) {
        store.set(
          lastVisitedObjectMetadataItemIdState.atom,
          objectMetadataItemId,
        );
      }
    },
    [store],
  );

  return {
    setLastVisitedObjectMetadataId,
  };
};
