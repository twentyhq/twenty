import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useApplyCurrentViewSortsToCurrentRecordSorts = () => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const currentView = useRecoilValue(
    coreViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  const setCurrentRecordSorts = useSetRecoilComponentState(
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
