import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useContextStoreObjectMetadataItemOrThrow = (
  contextStoreInstanceId?: string,
  canFallbackToDefault?: boolean,
) => {
  const objectMetadataItemIdFromContextStoreInstance = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    contextStoreInstanceId,
  );

  const defaultObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId:
      objectMetadataItemIdFromContextStoreInstance ??
      (canFallbackToDefault ? defaultObjectMetadataItemId : '') ??
      '',
  });

  if (!objectMetadataItem) {
    throw new Error('Object metadata item is not set in context store');
  }

  return { objectMetadataItem };
};
