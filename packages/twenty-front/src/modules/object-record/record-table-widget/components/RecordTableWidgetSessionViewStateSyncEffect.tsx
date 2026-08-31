import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { type ViewerControlsConfiguration } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type RecordTableWidgetSessionViewStateSyncEffectProps = {
  recordIndexId: string;
  viewerControls?: ViewerControlsConfiguration;
};

export const RecordTableWidgetSessionViewStateSyncEffect = ({
  recordIndexId,
  viewerControls,
}: RecordTableWidgetSessionViewStateSyncEffectProps) => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const isFilterControlEnabled = viewerControls?.filter ?? false;
  const isSortControlEnabled = viewerControls?.sort ?? false;
  const { currentView } = useGetCurrentViewOnly();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );
  const store = useStore();

  const currentRecordFiltersAtom = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
    recordIndexId,
  );
  const currentRecordFilterGroupsAtom = useAtomComponentStateCallbackState(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );
  const anyFieldFilterValueAtom = useAtomComponentStateCallbackState(
    anyFieldFilterValueComponentState,
    recordIndexId,
  );
  const currentRecordSortsAtom = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
    recordIndexId,
  );
  const isSoftDeleteFilterActiveAtom = useAtomComponentStateCallbackState(
    isSoftDeleteFilterActiveComponentState,
    recordIndexId,
  );

  useEffect(() => {
    if (isPageLayoutInEditMode || !isDefined(currentView)) {
      return;
    }

    if (!isFilterControlEnabled) {
      const viewRecordFilters = mapViewFiltersToFilters(
        currentView.viewFilters,
        flattenedFieldMetadataItems,
      );
      const viewRecordFilterGroups = mapViewFilterGroupsToRecordFilterGroups(
        currentView.viewFilterGroups ?? [],
      );

      if (
        !isDeeplyEqual(store.get(currentRecordFiltersAtom), viewRecordFilters)
      ) {
        store.set(currentRecordFiltersAtom, viewRecordFilters);
      }

      if (
        !isDeeplyEqual(
          store.get(currentRecordFilterGroupsAtom),
          viewRecordFilterGroups,
        )
      ) {
        store.set(currentRecordFilterGroupsAtom, viewRecordFilterGroups);
      }

      const viewAnyFieldFilterValue = currentView.anyFieldFilterValue ?? '';

      if (store.get(anyFieldFilterValueAtom) !== viewAnyFieldFilterValue) {
        store.set(anyFieldFilterValueAtom, viewAnyFieldFilterValue);
      }

      store.set(isSoftDeleteFilterActiveAtom, false);
    }

    if (!isSortControlEnabled) {
      const viewRecordSorts = currentView.viewSorts.map(
        ({ viewId: _viewId, ...recordSort }) => recordSort,
      );

      if (!isDeeplyEqual(store.get(currentRecordSortsAtom), viewRecordSorts)) {
        store.set(currentRecordSortsAtom, viewRecordSorts);
      }
    }
  }, [
    isPageLayoutInEditMode,
    isFilterControlEnabled,
    isSortControlEnabled,
    currentView,
    flattenedFieldMetadataItems,
    store,
    currentRecordFiltersAtom,
    currentRecordFilterGroupsAtom,
    anyFieldFilterValueAtom,
    currentRecordSortsAtom,
    isSoftDeleteFilterActiveAtom,
  ]);

  return null;
};
