import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type AnyMetadataEntity = MetadataEntityTypeMap[MetadataEntityKey];

const OBJECTS_GROUP_KEYS: MetadataEntityKey[] = [
  'objectMetadataItems',
  'fieldMetadataItems',
  'indexMetadataItems',
];

const isRelationFieldEvent = (
  entityKey: MetadataEntityKey,
  record: Record<string, unknown>,
): boolean => {
  if (entityKey !== 'fieldMetadataItems') {
    return false;
  }

  const type = record.type as string | undefined;

  return (
    type === FieldMetadataType.RELATION ||
    type === FieldMetadataType.MORPH_RELATION
  );
};

export const MetadataStoreSSEEffect = () => {
  const { createDraftItems, updateDraftItems, deleteDraftItems, applyChanges } =
    useMetadataStore();
  const { loadStaleMetadataEntities } = useLoadStaleMetadataEntities();

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: (eventDetail) => {
      const entityKey = mapAllMetadataNameToEntityKey(eventDetail.metadataName);

      if (!isDefined(entityKey)) {
        return;
      }

      const collectionHash = eventDetail.updatedCollectionHash;
      const record =
        eventDetail.operation.type === 'create'
          ? eventDetail.operation.createdRecord
          : eventDetail.operation.type === 'update'
            ? eventDetail.operation.updatedRecord
            : undefined;

      if (isDefined(record) && isRelationFieldEvent(entityKey, record)) {
        loadStaleMetadataEntities(OBJECTS_GROUP_KEYS);

        return;
      }

      switch (eventDetail.operation.type) {
        case 'create': {
          createDraftItems(
            entityKey,
            [record as unknown as AnyMetadataEntity],
            collectionHash,
          );
          break;
        }
        case 'update': {
          updateDraftItems(
            entityKey,
            [record as unknown as AnyMetadataEntity],
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
