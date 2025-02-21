import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewSort } from '@/views/types/ViewSort';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';

export const useApplyViewSortsToCurrentRecordSorts = () => {
  const setCurrentRecordSorts = useSetRecoilComponentStateV2(
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
