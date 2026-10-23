import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import {
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { type FlatIndexMetadataItem } from '@/metadata-store/types/FlatIndexMetadataItem';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { cleanMorphRelationsTargetingObjectMetadataId } from '@/metadata-store/utils/cleanMorphRelationsTargetingObjectMetadataId';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveObjectMetadataItemFromDraft = () => {
  const store = useStore();
  const { removeFromDraft, updateInDraft } = useUpdateMetadataStoreDraft();

  const getPendingOrCurrentItems = useCallback(
    (metadataEntityKey: MetadataEntityKey) => {
      const entry = store.get(metadataStoreState.atomFamily(metadataEntityKey));

      return entry.status === 'draft-pending' ? entry.draft : entry.current;
    },
    [store],
  );

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

      const fieldMetadataItems = getPendingOrCurrentItems(
        'fieldMetadataItems',
      ) as FlatFieldMetadataItem[];

      removeFromDraft({
        key: 'fieldMetadataItems',
        itemIds: fieldMetadataItems
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
          getPendingOrCurrentItems(
            'fieldMetadataItems',
          ) as FlatFieldMetadataItem[],
          objectMetadataId,
        ),
      );

      removeFromDraft({
        key: 'indexMetadataItems',
        itemIds: (
          getPendingOrCurrentItems(
            'indexMetadataItems',
          ) as FlatIndexMetadataItem[]
        )
          .filter(
            (indexMetadataItem) =>
              indexMetadataItem.objectMetadataId === objectMetadataId,
          )
          .map((indexMetadataItem) => indexMetadataItem.id),
      });

      removeFromDraft({
        key: 'views',
        itemIds: (getPendingOrCurrentItems('views') as FlatView[])
          .filter((view) => view.objectMetadataId === objectMetadataId)
          .map((view) => view.id),
      });
    },
    [getPendingOrCurrentItems, removeFromDraft, updateInDraft],
  );

  return { removeObjectMetadataItemFromDraft };
};
