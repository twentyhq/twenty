import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const MetadataStoreSSEEffect = () => {
  const store = useStore();

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: (eventDetail) => {
      const entityKey = mapAllMetadataNameToEntityKey(eventDetail.metadataName);

      if (!isDefined(entityKey)) {
        return;
      }

      patchMetadataStoreFromSSEEvent({
        store,
        entityKey,
        operation: eventDetail.operation,
        updatedCollectionHash: eventDetail.updatedCollectionHash,
      });
    },
  });

  return null;
};
