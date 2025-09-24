import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';

export const useApplyViewSortsToCurrentRecordSorts = () => {
  const setCurrentRecordSorts = useSetRecoilComponentState(
    currentRecordSortsComponentState,
  );

  const applyViewSortsToCurrentRecordSorts = (
    viewSorts: CoreViewSortEssential[],
  ) => {
    const recordSorts = viewSorts.map((viewSort) => {
      const { viewId: _viewId, ...recordSort } = viewSort;
      return recordSort;
    });
    setCurrentRecordSorts(recordSorts);
  };

  return {
    applyViewSortsToCurrentRecordSorts,
  };
};
