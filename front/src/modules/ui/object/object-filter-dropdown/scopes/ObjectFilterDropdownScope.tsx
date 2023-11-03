import { ReactNode } from 'react';

import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';

import { Filter } from '../types/Filter';

import { ObjectFilterDropdownScopeInitEffect } from './init-effect/ObjectFilterDropdownScopeInitEffect';
import { ObjectFilterDropdownScopeInternalContext } from './scope-internal-context/ObjectFilterDropdownScopeInternalContext';

type ObjectFilterDropdownScopeProps = {
  children: ReactNode;
  filterScopeId: string;
  availableFilterDefinitions?: FilterDefinition[];
  onFilterSelect?: (filter: Filter) => void;
};

export const ObjectFilterDropdownScope = ({
  children,
  filterScopeId,
  availableFilterDefinitions,
  onFilterSelect,
}: ObjectFilterDropdownScopeProps) => {
  return (
    <ObjectFilterDropdownScopeInternalContext.Provider
      value={{ scopeId: filterScopeId, onFilterSelect }}
    >
      <ObjectFilterDropdownScopeInitEffect
        filterScopeId={filterScopeId}
        availableFilterDefinitions={availableFilterDefinitions}
      />
      {children}
    </ObjectFilterDropdownScopeInternalContext.Provider>
  );
};
