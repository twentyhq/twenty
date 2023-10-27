import { useEffect } from 'react';

import { FilterDefinition } from '@/ui/data/filter/types/FilterDefinition';

import { useFilterStates } from '../../hooks/useFilterStates';

type FilterScopeInitEffectProps = {
  filterScopeId: string;
  availableFilters?: FilterDefinition[];
};

export const FilterScopeInitEffect = ({
  filterScopeId,
  availableFilters,
}: FilterScopeInitEffectProps) => {
  const { setAvailableFilters } = useFilterStates(filterScopeId);

  useEffect(() => {
    if (availableFilters) {
      setAvailableFilters(availableFilters);
    }
  }, [availableFilters, setAvailableFilters]);

  return <></>;
};
