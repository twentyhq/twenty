import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useContextStoreCurrentObjectMetadataIdOrThrow = (
  instanceId?: string,
) => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
    instanceId,
  );

  if (!contextStoreCurrentObjectMetadataId) {
    throw new Error('contextStoreCurrentObjectMetadataIdComponent is not set');
  }

  return contextStoreCurrentObjectMetadataId;
};
