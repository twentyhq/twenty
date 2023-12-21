import { createContext } from 'react';

import { RecordUpdateHookParams } from '@/object-record/field/contexts/FieldContext';

export const RecordUpdateContext = createContext<
  (params: RecordUpdateHookParams) => void
>({} as any);
