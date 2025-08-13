import { createContext } from 'react';

import { type RecordUpdateHookParams } from '@/object-record/record-field/ui/contexts/FieldContext';

export const RecordUpdateContext = createContext<
  (params: RecordUpdateHookParams) => void
>({} as any);
