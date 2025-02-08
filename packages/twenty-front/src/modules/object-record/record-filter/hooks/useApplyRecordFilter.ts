import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useApplyRecordFilter = (componentInstanceId?: string) => {
  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();
  const selectedFilterCallbackState = useRecoilComponentCallbackStateV2(
    selectedFilterComponentState,
    componentInstanceId,
  );

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const applyRecordFilter = useRecoilCallback(
    ({ set }) =>
      (filter: RecordFilter | null) => {
        set(selectedFilterCallbackState, filter);

        if (isDefined(filter)) {
          upsertCombinedViewFilter(filter);
          upsertRecordFilter(filter);
        }
      },
    [selectedFilterCallbackState, upsertCombinedViewFilter, upsertRecordFilter],
  );

  return {
    applyRecordFilter,
  };
};
