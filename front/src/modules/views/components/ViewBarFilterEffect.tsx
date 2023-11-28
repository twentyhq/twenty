import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { Filter } from '@/ui/object/object-filter-dropdown/types/Filter';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';

import { useFilterStates } from '../../ui/object/object-filter-dropdown/hooks/useFilterStates';

type ViewBarFilterEffectProps = {
  filterScopeId: string;
  onFilterSelect?: ((filter: Filter) => void) | undefined;
};

export const ViewBarFilterEffect = ({
  filterScopeId,
  onFilterSelect,
}: ViewBarFilterEffectProps) => {
  const { availableFilterDefinitionsState } = useViewScopedStates();

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
