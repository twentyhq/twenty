import { RecordFieldColumnKindsContext } from '@/object-record/record-column-scope/contexts/RecordFieldColumnKindsContext';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useScopedRelationAliasesAndColumnKinds } from '@/object-record/record-column-scope/hooks/useScopedRelationAliasesAndColumnKinds';
import { type ReactNode } from 'react';

type RecordFieldColumnsProviderProps = {
  children: ReactNode;
};

export const RecordFieldColumnsProvider = ({
  children,
}: RecordFieldColumnsProviderProps) => {
  const { scopedRelationAliases, columnKindByRecordFieldId } =
    useScopedRelationAliasesAndColumnKinds();

  return (
    <ScopedRelationAliasesContext.Provider value={scopedRelationAliases}>
      <RecordFieldColumnKindsContext.Provider value={columnKindByRecordFieldId}>
        {children}
      </RecordFieldColumnKindsContext.Provider>
    </ScopedRelationAliasesContext.Provider>
  );
};
