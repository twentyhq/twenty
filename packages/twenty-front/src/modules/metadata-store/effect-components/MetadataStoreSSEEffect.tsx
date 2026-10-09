import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useResyncMetadataStore } from '@/metadata-store/hooks/useResyncMetadataStore';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { SSE_RESYNC_DEBOUNCE_TIME_IN_MS } from '@/sse-db-event/constants/SseResyncDebounceTimeInMs';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

type AnyMetadataEntity = MetadataEntityTypeMap[MetadataEntityKey];

export const MetadataStoreSSEEffect = () => {
  const { addToDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();
  const { resyncMetadataStore } = useResyncMetadataStore();
  const debouncedResyncMetadataStore = useDebouncedCallback(
    resyncMetadataStore,
    SSE_RESYNC_DEBOUNCE_TIME_IN_MS,
  );

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: (eventDetail) => {
      const entityKey = mapAllMetadataNameToEntityKey(eventDetail.metadataName);

      if (!isDefined(entityKey)) {
        return;
      }

      // The objects query resolves relations and collapses morph groups, so raw
      // row events cannot safely patch the snapshot it returns.
      if (
        entityKey === 'objectMetadataItems' ||
        entityKey === 'fieldMetadataItems' ||
        entityKey === 'indexMetadataItems'
      ) {
        debouncedResyncMetadataStore();
        return;
      }

      const collectionHash = eventDetail.updatedCollectionHash;

      switch (eventDetail.operation.type) {
        case 'create': {
          addToDraft<MetadataEntityKey>({
            key: entityKey,
            items: [
              eventDetail.operation
                .createdRecord as unknown as AnyMetadataEntity,
            ],
            collectionHash,
          });
          break;
        }
        case 'update': {
          addToDraft<MetadataEntityKey>({
            key: entityKey,
            items: [
              eventDetail.operation
                .updatedRecord as unknown as AnyMetadataEntity,
            ],
            collectionHash,
          });
          break;
        }
        case 'delete': {
          removeFromDraft({
            key: entityKey,
            itemIds: [eventDetail.operation.deletedRecordId],
            collectionHash,
          });
          break;
        }
      }

      applyChanges();
    },
  });

  return null;
};
