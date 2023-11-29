import { ReactNode } from 'react';

import { ObjectFilterDropdownScopeInternalContext } from './scope-internal-context/ObjectFilterDropdownScopeInternalContext';

type ObjectFilterDropdownScopeProps = {
  children: ReactNode;
  filterScopeId: string;
};

export const ObjectFilterDropdownScope = ({
  children,
  filterScopeId,
}: ObjectFilterDropdownScopeProps) => {
  return (
    <ObjectFilterDropdownScopeInternalContext.Provider
      value={{ scopeId: filterScopeId }}
    >
      {children}
    </ObjectFilterDropdownScopeInternalContext.Provider>
  );
};
