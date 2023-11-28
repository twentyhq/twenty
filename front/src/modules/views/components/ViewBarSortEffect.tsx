import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { Sort } from '@/ui/object/object-sort-dropdown/types/Sort';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';

import { useSortStates } from '../../ui/object/object-sort-dropdown/hooks/useSortStates';

type ViewBarSortEffectProps = {
  sortScopeId: string;
  onSortSelect?: ((sort: Sort) => void) | undefined;
};

export const ViewBarSortEffect = ({
  sortScopeId,
  onSortSelect,
}: ViewBarSortEffectProps) => {
  const { availableSortDefinitionsState } = useViewScopedStates();

  const availableSortDefinitions = useRecoilValue(
    availableSortDefinitionsState,
  );

  const { setAvailableSortDefinitions, setOnSortSelect } =
    useSortStates(sortScopeId);

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
