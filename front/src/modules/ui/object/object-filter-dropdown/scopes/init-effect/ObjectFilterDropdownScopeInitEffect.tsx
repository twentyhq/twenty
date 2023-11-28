import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { Filter } from '@/ui/object/object-filter-dropdown/types/Filter';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';

import { useFilterStates } from '../../hooks/useFilterStates';

type ObjectFilterDropdownScopeInitEffectProps = {
  filterScopeId: string;
  viewId: string;
  onFilterSelect?: ((filter: Filter) => void) | undefined;
};

export const ObjectFilterDropdownScopeInitEffect = ({
  filterScopeId,
  viewId,
  onFilterSelect,
}: ObjectFilterDropdownScopeInitEffectProps) => {
  const { availableFilterDefinitionsState } = useViewScopedStates({
    customViewScopeId: viewId,
  });

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );
  const { setAvailableFilterDefinitions, setOnFilterSelect } =
    useFilterStates(filterScopeId);

  useEffect(() => {
    if (availableFilterDefinitions) {
      setAvailableFilterDefinitions(availableFilterDefinitions);
    }

    if (onFilterSelect) {
      setOnFilterSelect(() => onFilterSelect);
    }
  }, [
    availableFilterDefinitions,
    onFilterSelect,
    setAvailableFilterDefinitions,
    setOnFilterSelect,
  ]);

  return <></>;
};
