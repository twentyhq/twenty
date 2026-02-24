import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const useApplyCurrentViewSortsToCurrentRecordSorts = () => {
  const currentViewId = useAtomComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const currentView = useFamilySelectorValue(coreViewFromViewIdFamilySelector, {
    viewId: currentViewId ?? '',
  });

  const setCurrentRecordSorts = useSetAtomComponentState(
    currentRecordSortsComponentState,
  );

  const applyCurrentViewSortsToCurrentRecordSorts = () => {
    if (isDefined(currentView)) {
      const recordSorts = currentView.viewSorts.map((viewSort) => {
        const { viewId: _viewId, ...recordSort } = viewSort;
        return recordSort;
      });
      setCurrentRecordSorts(recordSorts);
    }
  };

  return {
    applyCurrentViewSortsToCurrentRecordSorts,
  };
};
