import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useScopedRelationAliases } from '@/object-record/record-column-scope/hooks/useScopedRelationAliases';
import { type ReactNode } from 'react';

type ScopedRelationAliasesProviderProps = {
  children: ReactNode;
};

export const ScopedRelationAliasesProvider = ({
  children,
}: ScopedRelationAliasesProviderProps) => (
  <ScopedRelationAliasesContext.Provider value={useScopedRelationAliases()}>
    {children}
  </ScopedRelationAliasesContext.Provider>
);
