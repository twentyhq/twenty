import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { isDefined } from 'twenty-shared/utils';

type AnyMetadataEntity = MetadataEntityTypeMap[MetadataEntityKey];

export const MetadataStoreSSEEffect = () => {
  const { createDraftItems, updateDraftItems, deleteDraftItems, applyChanges } =
    useMetadataStore();

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: (eventDetail) => {
      const entityKey = mapAllMetadataNameToEntityKey(eventDetail.metadataName);

      if (!isDefined(entityKey)) {
        return;
      }

      const collectionHash = eventDetail.updatedCollectionHash;

      switch (eventDetail.operation.type) {
        case 'create': {
          createDraftItems(
            entityKey,
            [
              eventDetail.operation
                .createdRecord as unknown as AnyMetadataEntity,
            ],
            collectionHash,
          );
          break;
        }
        case 'update': {
          updateDraftItems(
            entityKey,
            [
              eventDetail.operation
                .updatedRecord as unknown as AnyMetadataEntity,
            ],
            collectionHash,
          );
          break;
        }
        case 'delete': {
          deleteDraftItems(
            entityKey,
            [eventDetail.operation.deletedRecordId],
            collectionHash,
          );
          break;
        }
      }

      applyChanges();
    },
  });

  return null;
};
