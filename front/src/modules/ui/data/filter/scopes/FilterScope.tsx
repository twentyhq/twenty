import { ReactNode } from 'react';

import { FilterDefinition } from '@/ui/data/filter/types/FilterDefinition';

import { FilterScopeInternalContext } from './scope-internal-context/FilterScopeInternalContext';

type FilterScopeProps = {
  children: ReactNode;
  filterScopeId: string;
  availableFilters?: FilterDefinition[];
};

export const FilterScope = ({ children, filterScopeId }: FilterScopeProps) => {
  return (
    <FilterScopeInternalContext.Provider value={{ scopeId: filterScopeId }}>
      {children}
    </FilterScopeInternalContext.Provider>
  );
};
