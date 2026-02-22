import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSetLastVisitedObjectMetadataId = () => {
  const setLastVisitedObjectMetadataId = useCallback(
    ({ objectMetadataItemId }: { objectMetadataItemId: string }) => {
      const objectMetadataItems = jotaiStore.get(objectMetadataItemsState.atom);

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === objectMetadataItemId,
      );

      const lastVisitedObjectMetadataItemId = jotaiStore.get(
        lastVisitedObjectMetadataItemIdState.atom,
      );

      if (
        isDefined(objectMetadataItem) &&
        lastVisitedObjectMetadataItemId !== objectMetadataItemId
      ) {
        jotaiStore.set(
          lastVisitedObjectMetadataItemIdState.atom,
          objectMetadataItemId,
        );
      }
    },
    [],
  );

  return {
    setLastVisitedObjectMetadataId,
  };
};
