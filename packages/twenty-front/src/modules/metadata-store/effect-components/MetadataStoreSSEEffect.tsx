import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { INCONSISTENT_METADATA_STORE_RESYNC_DELAY_MS } from '@/metadata-store/constants/InconsistentMetadataStoreResyncDelayMs';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { addTypenamesToFlatPageLayoutWidget } from '@/metadata-store/utils/addTypenamesToFlatPageLayoutWidget';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

type AnyMetadataEntity = MetadataEntityTypeMap[MetadataEntityKey];

const toMetadataStoreItem = (
  entityKey: MetadataEntityKey,
  record: Record<string, unknown>,
): AnyMetadataEntity =>
  entityKey === 'pageLayoutWidgets'
    ? addTypenamesToFlatPageLayoutWidget(
        record as unknown as FlatPageLayoutWidget,
      )
    : (record as unknown as AnyMetadataEntity);

export const MetadataStoreSSEEffect = () => {
  const { addToDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();

  const resyncIfStillInconsistent = useDebouncedCallback(() => {
    if (!applyChanges().isPendingStateConsistent) {
      invalidateMetadataStore();
    }
  }, INCONSISTENT_METADATA_STORE_RESYNC_DELAY_MS);

  const applyBufferedChanges = () => {
    if (applyChanges().isPendingStateConsistent) {
      resyncIfStillInconsistent.cancel();
      return;
    }

    resyncIfStillInconsistent();
  };

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: (eventDetail) => {
      const entityKey = mapAllMetadataNameToEntityKey(eventDetail.metadataName);

      if (!isDefined(entityKey)) {
        return;
      }

      const collectionHash = eventDetail.updatedCollectionHash;

      switch (eventDetail.operation.type) {
        case 'create': {
          addToDraft({
            key: entityKey,
            items: [
              toMetadataStoreItem(
                entityKey,
                eventDetail.operation.createdRecord,
              ),
            ],
            collectionHash,
          });
          break;
        }
        case 'update': {
          addToDraft({
            key: entityKey,
            items: [
              toMetadataStoreItem(
                entityKey,
                eventDetail.operation.updatedRecord,
              ),
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

      queueMicrotask(applyBufferedChanges);
    },
  });

  return null;
};
