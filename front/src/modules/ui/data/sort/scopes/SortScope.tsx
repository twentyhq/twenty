import { ReactNode } from 'react';

import { Sort } from '../types/Sort';
import { SortDefinition } from '../types/SortDefinition';

import { SortScopeInitEffect } from './init-effect/SortScopeInitEffect';
import { SortScopeInternalContext } from './scope-internal-context/SortScopeInternalContext';

type SortScopeProps = {
  children: ReactNode;
  sortScopeId: string;
  availableSorts?: SortDefinition[];
  onSortAdd?: (sort: Sort) => void | Promise<void>;
};

export const SortScope = ({
  children,
  sortScopeId,
  availableSorts,
  onSortAdd,
}: SortScopeProps) => {
  return (
    <SortScopeInternalContext.Provider
      value={{ scopeId: sortScopeId, onSortAdd }}
    >
      <SortScopeInitEffect
        sortScopeId={sortScopeId}
        availableSorts={availableSorts}
      />
      {children}
    </SortScopeInternalContext.Provider>
  );
};
