import { type RecordFieldColumnKind } from '@/object-record/record-column-scope/types/RecordFieldColumnKind';
import { createContext } from 'react';

export const RecordFieldColumnKindsContext = createContext<
  Record<string, RecordFieldColumnKind>
>({});
