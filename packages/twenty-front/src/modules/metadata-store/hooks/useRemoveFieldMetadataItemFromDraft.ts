import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { getMorphFieldMetadataItemsToUpsertOnFieldDeletion } from '@/metadata-store/utils/getMorphFieldMetadataItemsToUpsertOnFieldDeletion';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveFieldMetadataItemFromDraft = () => {
  const store = useStore();
  const { addToDraft, removeFromDraft } = useUpdateMetadataStoreDraft();

  const removeFieldMetadataItemFromDraft = useCallback(
    ({
      fieldMetadataId,
      collectionHash,
    }: {
      fieldMetadataId: string;
      collectionHash?: string;
    }) => {
      const entry = store.get(
        metadataStoreState.atomFamily('fieldMetadataItems'),
      );

      const baseFieldMetadataItems = (
        entry.status === 'draft-pending' ? entry.draft : entry.current
      ) as FlatFieldMetadataItem[];

      const morphFieldMetadataItemsToUpsert =
        getMorphFieldMetadataItemsToUpsertOnFieldDeletion(
          baseFieldMetadataItems,
          fieldMetadataId,
        );

      removeFromDraft({
        key: 'fieldMetadataItems',
        itemIds: [fieldMetadataId],
        collectionHash,
      });

      addToDraft({
        key: 'fieldMetadataItems',
        items: morphFieldMetadataItemsToUpsert,
      });
    },
    [store, addToDraft, removeFromDraft],
  );

  return { removeFieldMetadataItemFromDraft };
};
