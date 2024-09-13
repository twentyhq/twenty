import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useSortDropdown';
import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useUpsertCombinedViewSorts } from '@/views/hooks/useUpsertCombinedViewSorts';
import { availableSortDefinitionsComponentState } from '@/views/states/availableSortDefinitionsComponentState';
import { isDefined } from '~/utils/isDefined';

type ViewBarSortEffectProps = {
  sortDropdownId: string;
};

export const ViewBarSortEffect = ({
  sortDropdownId,
}: ViewBarSortEffectProps) => {
  const { upsertCombinedViewSort } = useUpsertCombinedViewSorts();

  // TDOO: verify this instance id works
  const availableSortDefinitions = useRecoilComponentValueV2(
    availableSortDefinitionsComponentState,
  );

  const { onSortSelectState } = useSortDropdown({
    sortDropdownId,
  });

  // TDOO: verify this instance id works
  const setAvailableSortDefinitionsInSortDropdown =
    useSetRecoilComponentStateV2(
      availableSortDefinitionsComponentState,
      sortDropdownId,
    );
  const setOnSortSelect = useSetRecoilState(onSortSelectState);

  useEffect(() => {
    if (isDefined(availableSortDefinitions)) {
      setAvailableSortDefinitionsInSortDropdown(availableSortDefinitions);
    }
    setOnSortSelect(() => (sort: Sort | null) => {
      if (isDefined(sort)) {
        upsertCombinedViewSort(sort);
      }
    });
  }, [
    availableSortDefinitions,
    setAvailableSortDefinitionsInSortDropdown,
    setOnSortSelect,
    upsertCombinedViewSort,
  ]);

  return <></>;
};
