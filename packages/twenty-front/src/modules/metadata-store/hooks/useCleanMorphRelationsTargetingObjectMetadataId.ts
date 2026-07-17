import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { cleanMorphRelationsTargetingObjectMetadataId } from '@/metadata-store/utils/cleanMorphRelationsTargetingObjectMetadataId';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useCleanMorphRelationsTargetingObjectMetadataId = () => {
  const store = useStore();
  const { updateInDraft } = useUpdateMetadataStoreDraft();

  const cleanMorphRelations = useCallback(
    (deletedObjectMetadataId: string) => {
      const entry = store.get(
        metadataStoreState.atomFamily('fieldMetadataItems'),
      );

      const baseFieldMetadataItems = (
        entry.status === 'draft-pending' ? entry.draft : entry.current
      ) as FlatFieldMetadataItem[];

      const cleanedFieldMetadataItems =
        cleanMorphRelationsTargetingObjectMetadataId(
          baseFieldMetadataItems,
          deletedObjectMetadataId,
        );

      if (cleanedFieldMetadataItems.length === 0) {
        return;
      }

      updateInDraft('fieldMetadataItems', cleanedFieldMetadataItems);
    },
    [store, updateInDraft],
  );

  return { cleanMorphRelations };
};
