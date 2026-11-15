import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useSaveAnyFieldFilterToView } from '@/views/hooks/useSaveAnyFieldFilterToView';
import { useSaveRecordFiltersToView } from '@/views/hooks/useSaveRecordFiltersToView';
import { useSaveRecordSortsToView } from '@/views/hooks/useSaveRecordSortsToView';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useSaveCurrentViewFiltersAndSorts = () => {
  const store = useStore();
  const { canPersistChanges } = useCanPersistViewChanges();
  const { currentView } = useGetCurrentViewOnly();

  const { saveRecordSortsToView } = useSaveRecordSortsToView();
  const { saveRecordFiltersToView } = useSaveRecordFiltersToView();
  const { saveAnyFieldFilterToView } = useSaveAnyFieldFilterToView();

  const currentRecordSortsCallbackState = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );

  const currentRecordFiltersCallbackState = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilterGroupsCallbackState =
    useAtomComponentStateCallbackState(currentRecordFilterGroupsComponentState);

  const saveCurrentViewFilterAndSorts = async () => {
    if (canPersistChanges && isDefined(currentView)) {
      await saveRecordSortsToView({
        view: currentView,
        recordSorts: store.get(currentRecordSortsCallbackState),
      });

      await saveRecordFiltersToView({
        view: currentView,
        recordFilters: store.get(currentRecordFiltersCallbackState),
        recordFilterGroups: store.get(currentRecordFilterGroupsCallbackState),
      });
    }

    await saveAnyFieldFilterToView();
  };

  return {
    saveCurrentViewFilterAndSorts,
  };
};
