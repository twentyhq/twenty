import { ReactNode } from 'react';

import { DropdownScopeInternalContext } from './scope-internal-context/DropdownScopeInternalContext';

type DropdownScopeProps = {
  children: ReactNode;
  dropdownScopeId: string;
};

export const DropdownScope = ({
  children,
  dropdownScopeId,
}: DropdownScopeProps) => {
  return (
    <DropdownScopeInternalContext.Provider value={{ scopeId: dropdownScopeId }}>
      {children}
    </DropdownScopeInternalContext.Provider>
  );
};
