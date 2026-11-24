import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { createContext } from 'react';

export const ScopedRelationAliasesContext = createContext<
  ScopedRelationAlias[]
>([]);
