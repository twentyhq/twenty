import { useEffect } from 'react';

import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';

import { useFilterStates } from '../../hooks/useFilterStates';

type ObjectFilterDropdownScopeInitEffectProps = {
  filterScopeId: string;
  availableFilterDefinitions?: FilterDefinition[];
};

export const ObjectFilterDropdownScopeInitEffect = ({
  filterScopeId,
  availableFilterDefinitions,
}: ObjectFilterDropdownScopeInitEffectProps) => {
  const { setAvailableFilterDefinitions } = useFilterStates(filterScopeId);

  useEffect(() => {
    if (availableFilterDefinitions) {
      setAvailableFilterDefinitions(availableFilterDefinitions);
    }
  }, [availableFilterDefinitions, setAvailableFilterDefinitions]);

  return <></>;
};
