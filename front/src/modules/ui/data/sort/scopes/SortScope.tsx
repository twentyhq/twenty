import { ReactNode } from 'react';

import { SortDefinition } from '../../view-bar/types/SortDefinition';

import { SortScopeInternalContext } from './scope-internal-context/SortScopeInternalContext';

type SortScopeProps = {
  children: ReactNode;
  sortScopeId: string;
  availableSorts?: SortDefinition[];
  onSortAdd?: (sort: SortDefinition) => void | Promise<void>;
};

export const SortScope = ({
  children,
  sortScopeId,
  onSortAdd,
}: SortScopeProps) => {
  return (
    <SortScopeInternalContext.Provider
      value={{ scopeId: sortScopeId, onSortAdd }}
    >
      {children}
    </SortScopeInternalContext.Provider>
  );
};
