import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useCleanMorphRelationsTargetingObjectMetadataId } from '@/metadata-store/hooks/useCleanMorphRelationsTargetingObjectMetadataId';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { addTypenamesToFlatPageLayoutWidget } from '@/metadata-store/utils/addTypenamesToFlatPageLayoutWidget';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { isDefined } from 'twenty-shared/utils';

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
  const { cleanMorphRelations } =
    useCleanMorphRelationsTargetingObjectMetadataId();

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

          if (entityKey === 'objectMetadataItems') {
            cleanMorphRelations(eventDetail.operation.deletedRecordId);
          }
          break;
        }
      }

      applyChanges();
    },
  });

  return null;
};
