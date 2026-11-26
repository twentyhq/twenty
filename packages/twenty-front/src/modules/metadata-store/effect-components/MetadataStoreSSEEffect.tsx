import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { addTypenamesToFlatPageLayoutWidget } from '@/metadata-store/utils/addTypenamesToFlatPageLayoutWidget';
import { getDraftOrCurrentMetadataItems } from '@/metadata-store/utils/getDraftOrCurrentMetadataItems';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { useStore } from 'jotai';
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
  const store = useStore();
  const { addToDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: (eventDetail) => {
      const entityKey = mapAllMetadataNameToEntityKey(eventDetail.metadataName);

      if (!isDefined(entityKey)) {
        return;
      }

      const collectionHash = eventDetail.updatedCollectionHash;
      let hasGainedAccessToView = false;

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
          const updatedRecordId = eventDetail.operation.updatedRecord.id;

          hasGainedAccessToView =
            entityKey === 'views' &&
            !getDraftOrCurrentMetadataItems({
              store,
              metadataEntityKey: 'views',
            }).some((view) => view.id === updatedRecordId);

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

      applyChanges();

      if (hasGainedAccessToView) {
        invalidateMetadataStore(['views']);
      }
    },
  });

  return null;
};
