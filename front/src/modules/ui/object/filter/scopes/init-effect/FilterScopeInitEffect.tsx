import { useEffect } from 'react';

import { FilterDefinition } from '@/ui/object/filter/types/FilterDefinition';

import { useFilterStates } from '../../hooks/useFilterStates';

type FilterScopeInitEffectProps = {
  filterScopeId: string;
  availableFilterDefinitions?: FilterDefinition[];
};

export const FilterScopeInitEffect = ({
  filterScopeId,
  availableFilterDefinitions,
}: FilterScopeInitEffectProps) => {
  const { setAvailableFilterDefinitions } = useFilterStates(filterScopeId);

  useEffect(() => {
    if (availableFilterDefinitions) {
      setAvailableFilterDefinitions(availableFilterDefinitions);
    }
  }, [availableFilterDefinitions, setAvailableFilterDefinitions]);

  return <></>;
};
