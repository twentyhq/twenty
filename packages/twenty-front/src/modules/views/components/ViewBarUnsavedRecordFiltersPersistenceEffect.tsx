import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAreViewFilterGroupsDifferentFromRecordFilterGroups } from '@/views/hooks/useAreViewFilterGroupsDifferentFromRecordFilterGroups';
import { useAreViewFiltersDifferentFromRecordFilters } from '@/views/hooks/useAreViewFiltersDifferentFromRecordFilters';
import { loadedRecordFiltersViewIdComponentState } from '@/views/states/loadedRecordFiltersViewIdComponentState';
import { unsavedRecordFiltersFamilyState } from '@/views/states/unsavedRecordFiltersFamilyState';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarUnsavedRecordFiltersPersistenceEffect = () => {
  const store = useStore();

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    recordIndexId,
  );
  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const { viewFiltersAreDifferentFromRecordFilters } =
    useAreViewFiltersDifferentFromRecordFilters();
  const { viewFilterGroupsAreDifferentFromRecordFilterGroups } =
    useAreViewFilterGroupsDifferentFromRecordFilterGroups();

  const loadedRecordFiltersViewId = useAtomComponentStateValue(
    loadedRecordFiltersViewIdComponentState,
    recordIndexId,
  );

  const hasUnsavedRecordFilters =
    viewFiltersAreDifferentFromRecordFilters ||
    viewFilterGroupsAreDifferentFromRecordFilterGroups;

  useEffect(() => {
    if (
      !isDefined(contextStoreCurrentViewId) ||
      loadedRecordFiltersViewId !== contextStoreCurrentViewId
    ) {
      return;
    }

    store.set(
      unsavedRecordFiltersFamilyState.atomFamily({
        viewId: contextStoreCurrentViewId,
      }),
      hasUnsavedRecordFilters
        ? {
            recordFilters: currentRecordFilters,
            recordFilterGroups: currentRecordFilterGroups,
          }
        : null,
    );
  }, [
    contextStoreCurrentViewId,
    currentRecordFilterGroups,
    currentRecordFilters,
    loadedRecordFiltersViewId,
    hasUnsavedRecordFilters,
    store,
  ]);

  return null;
};
