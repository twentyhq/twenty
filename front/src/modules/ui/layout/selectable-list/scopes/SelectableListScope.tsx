import { ReactNode } from 'react';

import { SelectableListScopeInternalContext } from './scope-internal-context/SelectableListScopeInternalContext';

type SelectableListScopeProps = {
  children: ReactNode;
  selectableListScopeId: string;
};

export const SelectableListScope = ({
  children,
  selectableListScopeId,
}: SelectableListScopeProps) => {
  return (
    <SelectableListScopeInternalContext.Provider
      value={{ scopeId: selectableListScopeId }}
    >
      {children}
    </SelectableListScopeInternalContext.Provider>
  );
};
