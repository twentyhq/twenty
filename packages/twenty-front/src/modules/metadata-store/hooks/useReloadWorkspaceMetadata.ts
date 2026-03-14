import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { type View } from '@/views/types/View';
import { coreViewsState } from '@/views/states/coreViewState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useReloadWorkspaceMetadata = () => {
  const store = useStore();
  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();
  const { updateDraft, applyChanges, resetMetadataStore } = useMetadataStore();

  const reloadWorkspaceMetadata = useCallback(async () => {
    resetMetadataStore();

    await refreshObjectMetadataItems();

    // TODO: align generated ViewType with app ViewType to remove this cast
    const loadedViews = store.get(coreViewsState.atom) as unknown as View[];
    updateDraft('views', loadedViews);
    applyChanges();
  }, [
    resetMetadataStore,
    refreshObjectMetadataItems,
    store,
    updateDraft,
    applyChanges,
  ]);

  const resetToMockedMetadata = useCallback(async () => {
    resetMetadataStore();

    await loadMockedObjectMetadataItems();
  }, [resetMetadataStore, loadMockedObjectMetadataItems]);

  return { reloadWorkspaceMetadata, resetToMockedMetadata };
};
