import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useContextStoreObjectMetadataItemOrThrow = (
  contextStoreInstanceId?: string,
) => {
  const objectMetadataItem = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemComponentState,
    contextStoreInstanceId,
  );

  if (!objectMetadataItem) {
    throw new Error('Object metadata item is not se in context store');
  }

  return { objectMetadataItem };
};
