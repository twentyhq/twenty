import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';

export const useApplyViewSortsToCurrentRecordSorts = () => {
  const setCurrentRecordSorts = useSetRecoilComponentStateV2(
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
