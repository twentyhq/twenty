import { ReactNode } from 'react';

import { FilterDefinition } from '@/ui/object/filter/types/FilterDefinition';

import { Filter } from '../types/Filter';

import { FilterScopeInitEffect } from './init-effect/FilterScopeInitEffect';
import { FilterScopeInternalContext } from './scope-internal-context/FilterScopeInternalContext';

type FilterScopeProps = {
  children: ReactNode;
  filterScopeId: string;
  availableFilterDefinitions?: FilterDefinition[];
  onFilterSelect?: (filter: Filter) => void;
};

export const FilterScope = ({
  children,
  filterScopeId,
  availableFilterDefinitions,
  onFilterSelect,
}: FilterScopeProps) => {
  return (
    <FilterScopeInternalContext.Provider
      value={{ scopeId: filterScopeId, onFilterSelect }}
    >
      <FilterScopeInitEffect
        filterScopeId={filterScopeId}
        availableFilterDefinitions={availableFilterDefinitions}
      />
      {children}
    </FilterScopeInternalContext.Provider>
  );
};
