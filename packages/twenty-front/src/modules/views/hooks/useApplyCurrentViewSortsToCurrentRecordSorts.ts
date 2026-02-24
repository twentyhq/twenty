import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const useApplyCurrentViewSortsToCurrentRecordSorts = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const currentView = useFamilySelectorValueV2(
    coreViewFromViewIdFamilySelector,
    { viewId: currentViewId ?? '' },
  );

  const setCurrentRecordSorts = useSetRecoilComponentStateV2(
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
