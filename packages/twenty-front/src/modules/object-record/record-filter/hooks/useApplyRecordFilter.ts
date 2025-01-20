import { onFilterSelectComponentState } from '@/object-record/object-filter-dropdown/states/onFilterSelectComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useApplyRecordFilter = (componentInstanceId?: string) => {
  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();
  const selectedFilterCallbackState = useRecoilComponentCallbackStateV2(
    selectedFilterComponentState,
    componentInstanceId,
  );

  const onFilterSelectCallbackState = useRecoilComponentCallbackStateV2(
    onFilterSelectComponentState,
    componentInstanceId,
  );

  const applyRecordFilter = useRecoilCallback(
    ({ set, snapshot }) =>
      (filter: RecordFilter | null) => {
        set(selectedFilterCallbackState, filter);

        const onFilterSelect = getSnapshotValue(
          snapshot,
          onFilterSelectCallbackState,
        );

        if (isDefined(filter)) {
          upsertCombinedViewFilter(filter);
        }

        onFilterSelect?.(filter);
      },
    [
      selectedFilterCallbackState,
      onFilterSelectCallbackState,
      upsertCombinedViewFilter,
    ],
  );

  return {
    applyRecordFilter,
  };
};
