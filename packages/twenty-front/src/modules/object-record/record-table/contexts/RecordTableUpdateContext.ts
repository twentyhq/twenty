import { createContext } from 'react';

import { type RecordUpdateHookParams } from '@/object-record/record-field/ui/contexts/FieldContext';

export const RecordTableUpdateContext = createContext<
  ((params: RecordUpdateHookParams) => void) | undefined
>(undefined);
