import { ReactNode } from 'react';

import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
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
    <ObjectFilterDropdownComponentInstanceContext.Provider
      value={{ instanceId: filterScopeId }}
    >
      <ObjectFilterDropdownScopeInternalContext.Provider
        value={{ scopeId: filterScopeId }}
      >
        {children}
      </ObjectFilterDropdownScopeInternalContext.Provider>
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  );
};
