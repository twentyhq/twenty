import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useSaveRecordFiltersToView } from '@/views/hooks/useSaveRecordFiltersToView';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters =
  () => {
    const { canPersistChanges } = useCanPersistViewChanges();
    const { currentView } = useGetCurrentViewOnly();
    const { saveRecordFiltersToView } = useSaveRecordFiltersToView();

    const store = useStore();

    const currentRecordFilterGroupsCallbackState =
      useAtomComponentStateCallbackState(
        currentRecordFilterGroupsComponentState,
      );

    const currentRecordFiltersCallbackState =
      useAtomComponentStateCallbackState(currentRecordFiltersComponentState);

    const saveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters =
      useCallback(async () => {
        if (!canPersistChanges || !isDefined(currentView)) {
          return;
        }

        await saveRecordFiltersToView({
          view: currentView,
          recordFilters: store.get(currentRecordFiltersCallbackState),
          recordFilterGroups: store.get(currentRecordFilterGroupsCallbackState),
        });
      }, [
        canPersistChanges,
        currentView,
        store,
        currentRecordFilterGroupsCallbackState,
        currentRecordFiltersCallbackState,
        saveRecordFiltersToView,
      ]);

    return {
      saveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters,
    };
  };
