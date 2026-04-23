import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveDraftViewForRecordTableWidget = () => {
  const { removeFromDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const store = useStore();

  const removeDraftViewForRecordTableWidget = useCallback(
    (viewId: string) => {
      const allViewFields = store.get(
        metadataStoreState.atomFamily('viewFields'),
      ).current as FlatViewField[];

      const viewFieldIdsToRemove = allViewFields
        .filter((field) => field.viewId === viewId)
        .map((field) => field.id);

      removeFromDraft({ key: 'viewFields', itemIds: viewFieldIdsToRemove });
      removeFromDraft({ key: 'views', itemIds: [viewId] });

      applyChanges();
    },
    [applyChanges, removeFromDraft, store],
  );

  return { removeDraftViewForRecordTableWidget };
};
