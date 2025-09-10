import { useCheckIsSoftDeleteFilter } from '@/object-record/record-filter/hooks/useCheckIsSoftDeleteFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

const useHasAnySoftDeleteFilter = () => {
  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const { checkHasAnySoftDeleteFilter } = useCheckIsSoftDeleteFilter();

  const hasSoftDeleteFilter = currentRecordFilters.some((recordFilter) =>
    checkHasAnySoftDeleteFilter(recordFilter),
  );

  return hasSoftDeleteFilter === true;
};

export default useHasAnySoftDeleteFilter;
