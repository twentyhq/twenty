import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
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

    const loadedViews = store.get(coreViewsState.atom);
    const {
      flatViews,
      flatViewFields,
      flatViewFilters,
      flatViewSorts,
      flatViewGroups,
      flatViewFilterGroups,
      flatViewFieldGroups,
    } = splitViewWithRelated(loadedViews);

    updateDraft('views', flatViews);
    updateDraft('viewFields', flatViewFields);
    updateDraft('viewFilters', flatViewFilters);
    updateDraft('viewSorts', flatViewSorts);
    updateDraft('viewGroups', flatViewGroups);
    updateDraft('viewFilterGroups', flatViewFilterGroups);
    updateDraft('viewFieldGroups', flatViewFieldGroups);
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
