import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useSortDropdown';
import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { useRecoilInstanceValue } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceValue';
import { useSetRecoilInstanceState } from '@/ui/utilities/state/instance/hooks/useSetRecoilInstanceState';
import { useCombinedViewSorts } from '@/views/hooks/useCombinedViewSorts';
import { availableSortDefinitionsInstanceState } from '@/views/states/availableSortDefinitionsInstanceState';
import { isDefined } from '~/utils/isDefined';

type ViewBarSortEffectProps = {
  sortDropdownId: string;
};

export const ViewBarSortEffect = ({
  sortDropdownId,
}: ViewBarSortEffectProps) => {
  const { upsertCombinedViewSort } = useCombinedViewSorts();

  // TDOO: verify this instance id works
  const availableSortDefinitions = useRecoilInstanceValue(
    availableSortDefinitionsInstanceState,
  );

  const { onSortSelectState } = useSortDropdown({
    sortDropdownId,
  });

  // TDOO: verify this instance id works
  const setAvailableSortDefinitionsInSortDropdown = useSetRecoilInstanceState(
    availableSortDefinitionsInstanceState,
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
