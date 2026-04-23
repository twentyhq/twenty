import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type ViewSortEssential } from '@/views/types/ViewSortEssential';

export const useApplyViewSortsToCurrentRecordSorts = () => {
  const setCurrentRecordSorts = useSetAtomComponentState(
    currentRecordSortsComponentState,
  );

  const applyViewSortsToCurrentRecordSorts = (
    viewSorts: ViewSortEssential[],
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
