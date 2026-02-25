import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';

export const useApplyViewSortsToCurrentRecordSorts = () => {
  const setCurrentRecordSorts = useSetAtomComponentState(
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
