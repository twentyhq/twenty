import { ReactNode } from 'react';

import { SortDefinition } from '../../view-bar/types/SortDefinition';

import { SortScopeInternalContext } from './scope-internal-context/SortScopeInternalContext';

type SortScopeProps = {
  children: ReactNode;
  sortScopeId: string;
  availableSorts?: SortDefinition[];
};

export const SortScope = ({ children, sortScopeId }: SortScopeProps) => {
  return (
    <SortScopeInternalContext.Provider value={{ scopeId: sortScopeId }}>
      {children}
    </SortScopeInternalContext.Provider>
  );
};
