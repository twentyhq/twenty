import { ReactNode } from 'react';

import { Sort } from '../types/Sort';
import { SortDefinition } from '../types/SortDefinition';

import { ObjectSortDropdownScopeInitEffect } from './init-effect/ObjectSortDropdownScopeInitEffect';
import { ObjectSortDropdownScopeInternalContext } from './scope-internal-context/ObjectSortDropdownScopeInternalContext';

type ObjectSortDropdownScopeProps = {
  children: ReactNode;
  sortScopeId: string;
  availableSortDefinitions?: SortDefinition[];
  onSortSelect?: (sort: Sort) => void | Promise<void>;
};

export const ObjectSortDropdownScope = ({
  children,
  sortScopeId,
  availableSortDefinitions,
  onSortSelect,
}: ObjectSortDropdownScopeProps) => {
  return (
    <ObjectSortDropdownScopeInternalContext.Provider
      value={{ scopeId: sortScopeId, onSortSelect }}
    >
      <ObjectSortDropdownScopeInitEffect
        sortScopeId={sortScopeId}
        availableSortDefinitions={availableSortDefinitions}
      />
      {children}
    </ObjectSortDropdownScopeInternalContext.Provider>
  );
};
