import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useSortDropdown } from '@/ui/object/object-sort-dropdown/hooks/useSortDropdown';
import { Sort } from '@/ui/object/object-sort-dropdown/types/Sort';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';

type ViewBarSortEffectProps = {
  sortDropdownId: string;
  onSortSelect?: ((sort: Sort) => void) | undefined;
};

export const ViewBarSortEffect = ({
  sortDropdownId,
  onSortSelect,
}: ViewBarSortEffectProps) => {
  const { availableSortDefinitionsState } = useViewScopedStates();

  const availableSortDefinitions = useRecoilValue(
    availableSortDefinitionsState,
  );

  const { setAvailableSortDefinitions, setOnSortSelect } = useSortDropdown({
    sortDropdownId,
  });

  useEffect(() => {
    if (availableSortDefinitions) {
      setAvailableSortDefinitions(availableSortDefinitions);
    }
    if (onSortSelect) {
      setOnSortSelect(() => onSortSelect);
    }
  }, [
    availableSortDefinitions,
    onSortSelect,
    setAvailableSortDefinitions,
    setOnSortSelect,
  ]);

  return <></>;
};
