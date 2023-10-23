import { ReactNode } from 'react';

import { FilterScopeInternalContext } from './scope-internal-context/FilterScopeInternalContext';

type FilterScopeProps = {
  children: ReactNode;
  filterScopeId: string;
};

export const FilterScope = ({ children, filterScopeId }: FilterScopeProps) => {
  return (
    <FilterScopeInternalContext.Provider value={{ scopeId: filterScopeId }}>
      {children}
    </FilterScopeInternalContext.Provider>
  );
};
