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
    console.log('[ReloadWorkspaceMetadata] start: resetting store');
    resetMetadataStore();

    console.log('[ReloadWorkspaceMetadata] refreshing object metadata');
    await refreshObjectMetadataItems();
    const loadedObjects = store.get(objectMetadataItemsState.atom);
    console.log('[ReloadWorkspaceMetadata] objects loaded:', {
      count: loadedObjects.length,
    });
    updateDraft('objects', loadedObjects);
    applyChanges();

    const loadedViews = store.get(coreViewsState.atom);
    console.log('[ReloadWorkspaceMetadata] views from store:', {
      count: loadedViews.length,
    });
    updateDraft('views', loadedViews);
    const viewsPromoted = applyChanges();
    console.log('[ReloadWorkspaceMetadata] done', { viewsPromoted });
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
    updateDraft('objects', loadedObjects);
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
