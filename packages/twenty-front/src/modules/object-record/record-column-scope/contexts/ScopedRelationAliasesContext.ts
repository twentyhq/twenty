import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { createContext } from 'react';

// Cells read the table's alias list from here so they agree with what the table query fetched
export const ScopedRelationAliasesContext = createContext<
  ScopedRelationAlias[]
>([]);
