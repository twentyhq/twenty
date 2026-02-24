import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useContextStoreObjectMetadataItemOrThrow = (
  contextStoreInstanceId?: string,
) => {
  const objectMetadataItemId = useAtomComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    contextStoreInstanceId,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId ?? '',
  });

  if (!objectMetadataItem) {
    throw new Error('Object metadata item is not set in context store');
  }

  return { objectMetadataItem };
};
