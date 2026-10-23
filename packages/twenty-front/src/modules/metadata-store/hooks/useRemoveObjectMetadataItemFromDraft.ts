import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { cleanMorphRelationsTargetingObjectMetadataId } from '@/metadata-store/utils/cleanMorphRelationsTargetingObjectMetadataId';
import { getPendingOrCurrentMetadataItems } from '@/metadata-store/utils/getPendingOrCurrentMetadataItems';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveObjectMetadataItemFromDraft = () => {
  const store = useStore();
  const { removeFromDraft, updateInDraft } = useUpdateMetadataStoreDraft();

  const removeObjectMetadataItemFromDraft = useCallback(
    ({
      objectMetadataId,
      collectionHash,
    }: {
      objectMetadataId: string;
      collectionHash?: string;
    }) => {
      removeFromDraft({
        key: 'objectMetadataItems',
        itemIds: [objectMetadataId],
        collectionHash,
      });

      removeFromDraft({
        key: 'fieldMetadataItems',
        itemIds: getPendingOrCurrentMetadataItems({
          store,
          metadataEntityKey: 'fieldMetadataItems',
        })
          .filter(
            (fieldMetadataItem) =>
              fieldMetadataItem.objectMetadataId === objectMetadataId ||
              fieldMetadataItem.relation?.targetObjectMetadata.id ===
                objectMetadataId,
          )
          .map((fieldMetadataItem) => fieldMetadataItem.id),
      });

      updateInDraft(
        'fieldMetadataItems',
        cleanMorphRelationsTargetingObjectMetadataId(
          getPendingOrCurrentMetadataItems({
            store,
            metadataEntityKey: 'fieldMetadataItems',
          }),
          objectMetadataId,
        ),
      );

      removeFromDraft({
        key: 'indexMetadataItems',
        itemIds: getPendingOrCurrentMetadataItems({
          store,
          metadataEntityKey: 'indexMetadataItems',
        })
          .filter(
            (indexMetadataItem) =>
              indexMetadataItem.objectMetadataId === objectMetadataId,
          )
          .map((indexMetadataItem) => indexMetadataItem.id),
      });

      removeFromDraft({
        key: 'views',
        itemIds: getPendingOrCurrentMetadataItems({
          store,
          metadataEntityKey: 'views',
        })
          .filter((view) => view.objectMetadataId === objectMetadataId)
          .map((view) => view.id),
      });
    },
    [store, removeFromDraft, updateInDraft],
  );

  return { removeObjectMetadataItemFromDraft };
};
