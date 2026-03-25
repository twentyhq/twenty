import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const useApplyCurrentViewSortsToCurrentRecordSorts = () => {
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const currentView = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
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
