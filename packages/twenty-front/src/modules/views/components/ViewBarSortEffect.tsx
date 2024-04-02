import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useSortDropdown';
import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useCombinedViewSorts } from '@/views/hooks/useCombinedViewSorts';
import { isDefined } from '~/utils/isDefined';

type ViewBarSortEffectProps = {
  sortDropdownId: string;
};

export const ViewBarSortEffect = ({
  sortDropdownId,
}: ViewBarSortEffectProps) => {
  const { availableSortDefinitionsState } = useViewStates();
  const { upsertCombinedViewSort } = useCombinedViewSorts();

  const availableSortDefinitions = useRecoilValue(
    availableSortDefinitionsState,
  );

  const {
    availableSortDefinitionsState: availableSortDefinitionsInSortDropdownState,
    onSortSelectState,
  } = useSortDropdown({
    sortDropdownId,
  });

  const setAvailableSortDefinitionsInSortDropdown = useSetRecoilState(
    availableSortDefinitionsInSortDropdownState,
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
