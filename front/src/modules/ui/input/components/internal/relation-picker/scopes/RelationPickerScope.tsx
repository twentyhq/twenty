import { ReactNode } from 'react';

import { RelationPickerScopeInternalContext } from '@/ui/input/components/internal/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';

type RelationPickerScopeProps = {
  children: ReactNode;
  relationPickerScopeId: string;
};

export const RelationPickerScope = ({
  children,
  relationPickerScopeId,
}: RelationPickerScopeProps) => {
  return (
    <RelationPickerScopeInternalContext.Provider
      value={{ scopeId: relationPickerScopeId }}
    >
      {children}
    </RelationPickerScopeInternalContext.Provider>
  );
};
