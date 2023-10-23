import { ReactNode } from 'react';

import { SortScopeInternalContext } from './scope-internal-context/SortScopeInternalContext';

type SortScopeProps = {
  children: ReactNode;
  sortScopeId: string;
};

export const SortScope = ({ children, sortScopeId }: SortScopeProps) => {
  return (
    <SortScopeInternalContext.Provider value={{ scopeId: sortScopeId }}>
      {children}
    </SortScopeInternalContext.Provider>
  );
};
