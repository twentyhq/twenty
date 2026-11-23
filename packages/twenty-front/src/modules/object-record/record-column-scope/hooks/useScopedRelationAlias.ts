import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useContext } from 'react';

export const useScopedRelationAlias = (recordFieldId: string) =>
  useContext(ScopedRelationAliasesContext).find(
    (scopedRelationAlias) =>
      scopedRelationAlias.recordFieldId === recordFieldId,
  );
