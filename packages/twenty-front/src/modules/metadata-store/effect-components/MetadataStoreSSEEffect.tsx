import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useCleanMorphRelationsTargetingObjectMetadataId } from '@/metadata-store/hooks/useCleanMorphRelationsTargetingObjectMetadataId';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import {
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { doesFieldMetadataItemMatchFieldMetadataId } from '@/object-metadata/utils/doesFieldMetadataItemMatchFieldMetadataId';
import { useStore } from 'jotai';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type AnyMetadataEntity = MetadataEntityTypeMap[MetadataEntityKey];

const OBJECT_METADATA_ENTITY_KEYS: MetadataEntityKey[] = [
  'objectMetadataItems',
  'fieldMetadataItems',
  'indexMetadataItems',
];

export const MetadataStoreSSEEffect = () => {
  const store = useStore();
  const { addToDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();
  const { cleanMorphRelations } =
    useCleanMorphRelationsTargetingObjectMetadataId();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();

  const isMorphRelationRowInStore = (fieldMetadataId: string) => {
    const entry = store.get(
      metadataStoreState.atomFamily('fieldMetadataItems'),
    );

    const fieldMetadataItems = (
      entry.status === 'draft-pending' ? entry.draft : entry.current
    ) as FlatFieldMetadataItem[];

    return fieldMetadataItems.some(
      (fieldMetadataItem) =>
        fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION &&
        doesFieldMetadataItemMatchFieldMetadataId({
          fieldMetadataItem,
          fieldMetadataId,
        }),
    );
  };

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: (eventDetail) => {
      const entityKey = mapAllMetadataNameToEntityKey(eventDetail.metadataName);

      if (!isDefined(entityKey)) {
        return;
      }

      // An entry without a hash is waiting for a refetch: stamping the server hash on a local patch would skip it
      const collectionHash = isDefined(
        store.get(metadataStoreState.atomFamily(entityKey))
          .currentCollectionHash,
      )
        ? eventDetail.updatedCollectionHash
        : undefined;

      switch (eventDetail.operation.type) {
        case 'create': {
          addToDraft({
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
          addToDraft({
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
          // The store holds each morph group collapsed into one of its rows, and only the server
          // knows which row represents the group once one is gone
          if (
            entityKey === 'fieldMetadataItems' &&
            isMorphRelationRowInStore(eventDetail.operation.deletedRecordId)
          ) {
            invalidateMetadataStore(OBJECT_METADATA_ENTITY_KEYS);
            break;
          }

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
