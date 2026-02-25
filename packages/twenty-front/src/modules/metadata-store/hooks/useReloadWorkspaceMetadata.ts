import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
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
    const loadedObjects = store.get(objectMetadataItemsState.atom);
    updateDraft('objectMetadataItems', loadedObjects);
    applyChanges();

    const loadedViews = store.get(coreViewsState.atom);
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
    const loadedObjects = store.get(objectMetadataItemsState.atom);
    updateDraft('objectMetadataItems', loadedObjects);
    applyChanges();
  }, [
    resetMetadataStore,
    loadMockedObjectMetadataItems,
    store,
    updateDraft,
    applyChanges,
  ]);

  return { reloadWorkspaceMetadata, resetToMockedMetadata };
};
