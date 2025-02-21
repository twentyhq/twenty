import { useEffect } from 'react';

import { onSortSelectComponentState } from '@/object-record/object-sort-dropdown/states/onSortSelectScopedState';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useUpsertCombinedViewSorts } from '@/views/hooks/useUpsertCombinedViewSorts';
import { isDefined } from 'twenty-shared';

export const ViewBarSortEffect = () => {
  const { upsertCombinedViewSort } = useUpsertCombinedViewSorts();

  const { upsertRecordSort } = useUpsertRecordSort();

  const setOnSortSelect = useSetRecoilComponentStateV2(
    onSortSelectComponentState,
  );

  useEffect(() => {
    setOnSortSelect(() => (sort: RecordSort | null) => {
      if (isDefined(sort)) {
        upsertCombinedViewSort(sort);
        upsertRecordSort(sort);
      }
    });
  }, [setOnSortSelect, upsertCombinedViewSort, upsertRecordSort]);

  return <></>;
};
