import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { ViewSort } from '@/views/types/ViewSort';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';

export const useApplyViewSortsToCurrentRecordSorts = () => {
  const setCurrentRecordSorts = useSetRecoilComponentState(
    currentRecordSortsComponentState,
  );

  const applyViewSortsToCurrentRecordSorts = (viewSorts: ViewSort[]) => {
    const recordSortsToApply = mapViewSortsToSorts(viewSorts);

    setCurrentRecordSorts(recordSortsToApply);
  };

  return {
    applyViewSortsToCurrentRecordSorts,
  };
};
