import { ReactNode } from 'react';

import { FilterDefinition } from '@/ui/data/filter/types/FilterDefinition';

import { FilterScopeInitEffect } from './init-effect/FilterScopeInitEffect';
import { FilterScopeInternalContext } from './scope-internal-context/FilterScopeInternalContext';

type FilterScopeProps = {
  children: ReactNode;
  filterScopeId: string;
  availableFilters?: FilterDefinition[];
};

export const FilterScope = ({
  children,
  filterScopeId,
  availableFilters,
}: FilterScopeProps) => {
  return (
    <FilterScopeInternalContext.Provider value={{ scopeId: filterScopeId }}>
      <FilterScopeInitEffect
        filterScopeId={filterScopeId}
        availableFilters={availableFilters}
      />
      {children}
    </FilterScopeInternalContext.Provider>
  );
};
