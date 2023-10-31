import { ReactNode } from 'react';

import { Sort } from '../types/Sort';
import { SortDefinition } from '../types/SortDefinition';

import { SortScopeInitEffect } from './init-effect/SortScopeInitEffect';
import { SortScopeInternalContext } from './scope-internal-context/SortScopeInternalContext';

type SortScopeProps = {
  children: ReactNode;
  sortScopeId: string;
  availableSortDefinitions?: SortDefinition[];
  onSortSelect?: (sort: Sort) => void | Promise<void>;
};

export const SortScope = ({
  children,
  sortScopeId,
  availableSortDefinitions,
  onSortSelect,
}: SortScopeProps) => {
  return (
    <SortScopeInternalContext.Provider
      value={{ scopeId: sortScopeId, onSortSelect }}
    >
      <SortScopeInitEffect
        sortScopeId={sortScopeId}
        availableSortDefinitions={availableSortDefinitions}
      />
      {children}
    </SortScopeInternalContext.Provider>
  );
};
