import { ReactNode } from 'react';

import { ObjectSortDropdownScopeInternalContext } from './scope-internal-context/ObjectSortDropdownScopeInternalContext';

type ObjectSortDropdownScopeProps = {
  children: ReactNode;
  sortScopeId: string;
};

export const ObjectSortDropdownScope = ({
  children,
  sortScopeId,
}: ObjectSortDropdownScopeProps) => {
  return (
    <ObjectSortDropdownScopeInternalContext.Provider
      value={{ scopeId: sortScopeId }}
    >
      {children}
    </ObjectSortDropdownScopeInternalContext.Provider>
  );
};
