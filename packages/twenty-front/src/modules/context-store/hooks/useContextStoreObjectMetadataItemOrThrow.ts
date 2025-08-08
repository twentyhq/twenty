import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useContextStoreObjectMetadataItemOrThrow = (
  contextStoreInstanceId?: string,
) => {
  const objectMetadataItemId = useRecoilComponentValue(
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
