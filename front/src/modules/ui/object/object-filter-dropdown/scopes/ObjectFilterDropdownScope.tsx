import { ReactNode } from 'react';

import { Filter } from '../types/Filter';

import { ObjectFilterDropdownScopeInternalContext } from './scope-internal-context/ObjectFilterDropdownScopeInternalContext';

type ObjectFilterDropdownScopeProps = {
  children: ReactNode;
  filterScopeId: string;
  onFilterSelect?: (filter: Filter) => void;
};

export const ObjectFilterDropdownScope = ({
  children,
  filterScopeId,
  onFilterSelect,
}: ObjectFilterDropdownScopeProps) => {
  return (
    <ObjectFilterDropdownScopeInternalContext.Provider
      value={{ scopeId: filterScopeId, onFilterSelect }}
    >
      {children}
    </ObjectFilterDropdownScopeInternalContext.Provider>
  );
};
