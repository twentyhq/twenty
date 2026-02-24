import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useContextStoreObjectMetadataItem = (
  contextStoreInstanceId?: string,
) => {
  const objectMetadataItemId = useAtomComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    contextStoreInstanceId,
  );

  const objectMetadataItems = useAtomValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.id === objectMetadataItemId,
  );

  return { objectMetadataItem };
};
