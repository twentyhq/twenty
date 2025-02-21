import { useEffect } from 'react';

import { onSortSelectComponentState } from '@/object-record/object-sort-dropdown/states/onSortSelectScopedState';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useUpsertCombinedViewSorts } from '@/views/hooks/useUpsertCombinedViewSorts';
import { availableSortDefinitionsComponentState } from '@/views/states/availableSortDefinitionsComponentState';
import { isDefined } from 'twenty-shared';

export const ViewBarSortEffect = () => {
  const { upsertCombinedViewSort } = useUpsertCombinedViewSorts();

  // TDOO: verify this instance id works
  const availableSortDefinitions = useRecoilComponentValueV2(
    availableSortDefinitionsComponentState,
  );

  const { upsertRecordSort } = useUpsertRecordSort();

  const setOnSortSelect = useSetRecoilComponentStateV2(
    onSortSelectComponentState,
  );

  // TDOO: verify this instance id works
  const setAvailableSortDefinitionsInSortDropdown =
    useSetRecoilComponentStateV2(availableSortDefinitionsComponentState);

  useEffect(() => {
    if (isDefined(availableSortDefinitions)) {
      setAvailableSortDefinitionsInSortDropdown(availableSortDefinitions);
    }
    setOnSortSelect(() => (sort: RecordSort | null) => {
      if (isDefined(sort)) {
        upsertCombinedViewSort(sort);
        upsertRecordSort(sort);
      }
    });
  }, [
    availableSortDefinitions,
    setAvailableSortDefinitionsInSortDropdown,
    setOnSortSelect,
    upsertCombinedViewSort,
    upsertRecordSort,
  ]);

  return <></>;
};
